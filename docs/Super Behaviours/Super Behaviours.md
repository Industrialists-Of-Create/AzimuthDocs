# Super Block Entity Behaviours

`SuperBlockEntityBehaviour` extends Create's `BlockEntityBehaviour` with a fuller lifecycle, extra interaction hooks, typed lookup helpers, and extension interfaces for rendering, kinetics, and schematic requirements.

## Creating a behaviour

Extend `SuperBlockEntityBehaviour` the same way a regular `BlockEntityBehaviour` would be extended. The usual Create lifecycle methods such as `initialize()`, `tick()`, `lazyTick()`, and `destroy()` are inherited, so only the ones that matter need to be overridden:

```java
public class MyCustomBehaviour extends SuperBlockEntityBehaviour {

    public static final BehaviourType<MyCustomBehaviour> TYPE = new BehaviourType<>();

    public MyCustomBehaviour(final SmartBlockEntity be) {
        super(be);
        setLazyTickRate(5);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }

    @Override
    public void initialize() {
        super.initialize();
        // called once after the block entity becomes valid
    }

    @Override
    public void tick() {
        if (!hasLevel() || isClientLevel()) {
            return;
        }
        // per-tick server logic
    }

    @Override
    public void lazyTick() {
        super.lazyTick();
        // cheaper work on a slower cadence
    }

    @Override
    public void destroy() {
        // cleanup when the block entity is removed
    }
}
```

Then register it in the block entity's `addBehaviours` override as usual:

```java
@Override
public void addBehaviours(final List<BlockEntityBehaviour> behaviours) {
    super.addBehaviours(behaviours);
    behaviours.add(new MyCustomBehaviour(this));
}
```

## Tick cadence

### `tick()`

Runs every tick while the owning block entity is active. Use this for logic that cannot wait.

### `lazyTick()` and `setLazyTickRate(...)`

Use `setLazyTickRate(...)` when work only needs to happen periodically. For example, `Create: Bits 'n' Bobs` uses this pattern for cogwheel chain integrity checks and client-side shape refreshes:

```java
public CogwheelChainBehaviour(final SmartBlockEntity be) {
    super(be);
    setLazyTickRate(5);
}

@Override
public void lazyTick() {
    super.lazyTick();
    if (isClientLevel()) {
        updateChainShapes();
        return;
    }
    validateControllerState();
}
```

## Convenience helpers

The standard Create helpers such as `getPos()` and the lazy-tick methods still exist. `SuperBlockEntityBehaviour` adds a few extra shorthands so repeated block entity plumbing stays out of the way:

| Method | Description |
| --- | --- |
| `getLevel()` | Returns the level the block entity is in. |
| `getBlockState()` | Returns the current `BlockState` at this position. |
| `getBlockEntity()` | Returns the owning `BlockEntity`. |
| `hasLevel()` | Returns `true` if the level is non-null. |
| `isClientLevel()` | Returns `true` if running on the client. Check `hasLevel()` first. |
| `isServerLevel()` | Returns `true` if running on the server. Check `hasLevel()` first. |
| `sendData()` | Syncs the owning block entity to clients. |
| `transform(BlockEntity, StructureTransform)` | Override to respond to schematic transforms. |

## Getting behaviours from other block entities

`SuperBlockEntityBehaviour` adds typed helpers for looking up behaviours at arbitrary positions. This is useful for multi-blocks, linked machines, and controller/sub-part relationships.

### From a level and position

```java
// Returns Optional<T>, empty if not found or not loaded
Optional<MyCustomBehaviour> opt = SuperBlockEntityBehaviour.getOptional(level, pos, MyCustomBehaviour.TYPE);

// Returns T directly, throws IllegalStateException if missing
MyCustomBehaviour behaviour = SuperBlockEntityBehaviour.getOrThrow(level, pos, MyCustomBehaviour.TYPE);
```

### From a block entity reference

```java
Optional<MyCustomBehaviour> opt = SuperBlockEntityBehaviour.getOptional(otherBE, MyCustomBehaviour.TYPE);
MyCustomBehaviour behaviour = SuperBlockEntityBehaviour.getOrThrow(otherBE, MyCustomBehaviour.TYPE);
```

### Getting the same behaviour type at another position

This is the usual multi-block pattern for grabbing the matching behaviour from a controller or sibling part:

```java
// Nullable
MyCustomBehaviour other = this.getSameBehaviour(controllerPos);

// Optional
this.<MyCustomBehaviour>getSameBehaviourOptional(controllerPos)
    .ifPresent(ctrl -> ctrl.doSomething());

// Throwing
MyCustomBehaviour ctrl = this.getSameBehaviourOrThrow(controllerPos);
```

All three variants also accept a `BlockEntity` directly instead of a `BlockPos`.

A real controller lookup often looks like this:

```java
if (!isController() && controllerOffset != null && getLevel() != null) {
    final BlockPos controllerPos = getPos().offset(controllerOffset);
    this.<CogwheelChainBehaviour>getSameBehaviourOptional(controllerPos)
        .ifPresent(controller -> {
            if (!controller.isInSameChain(this)) {
                destroyForInvalidShape();
            }
        });
}
```

## Interaction hooks

Azimuth forwards a few common NeoForge block interaction events directly into behaviours.

### `onBlockBroken(BlockEvent.BreakEvent event)`

Override this to react when the block is broken by a player:

```java
@Override
public void onBlockBroken(final BlockEvent.BreakEvent event) {
    // handle drops, cleanup, refund items, and so on
}
```

### `onItemUse(PlayerInteractEvent.RightClickBlock event)`

Override this to react to right-click interactions on the owning block entity. This is the pattern used by the dyeable pipes in `Create: Bits 'n' Bobs`. For example, adding dye application behavior on top of the normal pipe interactions:

```java
@Override
public void onItemUse(final PlayerInteractEvent.RightClickBlock event) {
    if (!(event.getItemStack().getItem() instanceof final DyeItem dyeItem)) {
        return;
    }

    if (!event.getLevel().isClientSide) {
        applyColor(dyeItem.getDyeColor());
    }

    //Since we just get passed an event object, you just use cancelling and cancel results like normal
    event.setCanceled(true);
    event.setCancellationResult(InteractionResult.SUCCESS);
}
```

### `onBlockPlaced(BlockEvent.EntityPlaceEvent event)`

Override this to react once the block has been placed and the block entity exists. This is a good place to pull setup state from the placing entity or held item:

```java
@Override
public void onBlockPlaced(final BlockEvent.EntityPlaceEvent event) {
    if (event.getLevel().isClientSide()) {
        return;
    }
    if (!(event.getEntity() instanceof final Player player)) {
        return;
    }

    final ItemStack offhand = player.getOffhandItem();
    if (offhand.getItem() instanceof final DyeItem dyeItem) {
        applyColor(dyeItem.getDyeColor());
    }
}
```

If an interaction event is cancelled, Azimuth stops passing that event to later super behaviours on the same block entity.

## Using behaviour applicators

`BehaviourApplicators` injects behaviours onto block entities that are not owned by the mod. No subclassing or mixins are required.

### Global applicator

Registers a function that runs for every `SmartBlockEntity` when it collects its behaviours. Return `null` or an empty list to skip the entity:

```java
BehaviourApplicators.register(be -> {
    if (!(be instanceof MySpecificBlockEntity myBE)) {
        return null;
    }
    return List.of(new MyCustomBehaviour(myBE));
});
```

### Type-specific applicator

If only one block entity type matters, use `registerForType(...)` to avoid checking every entity:

```java
BehaviourApplicators.registerForType(
    () -> MyBlockEntityType.MY_TYPE.get(),
    be -> List.of(new MyCustomBehaviour((MySpecificBlockEntity) be))
);
```

### Resolving deferred registrations

Lazy resolution also happens on first use, but to help with debugging and error attribution, you can call resolve(), which will collapse all of the unregistered applicators, and throw necassary exceptions. For example, `Create: Bits 'n' Bobs` calls this during common setup:

```java
private static void commonSetup(final FMLCommonSetupEvent event) {
    BehaviourApplicators.resolveRegisteredTypes();
    VisualWrapperInterest.resolve(); // only needed for Flywheel visuals
}
```

`VisualWrapperInterest.resolve()` only matters for `RenderedBehaviourExtension` visuals created through `getVisualFactory()`. For the rendering side of that setup, see [RenderedBehaviourExtension](./Extensions/Rendered%20Extension.md).

## Extensions

Behaviours can implement extension interfaces to opt into additional systems. Extension lookups are cached, so only behaviours that actually implement a given extension pay the cost.

| Extension | Description |
| --- | --- |
| [`KineticBehaviourExtension`](./Extensions/Kinetic%20Extension.md) | Adds propagation positions and rotation transfer overrides for kinetic networks. |
| [`RenderedBehaviourExtension`](./Extensions/Rendered%20Extension.md) | Adds behaviour-level BER rendering, optional Flywheel visuals, and optional render bounds expansion. |
| [`ItemRequirementBehaviourExtension`](./Extensions/Item%20Requirement%20Extension.md) | Adds per-behaviour item requirements to schematic requirement flows. |
