# Super Block Entity Behaviours

`SuperBlockEntityBehaviours` are components for `SmartBlockEntities` (the basis of all Create block entities), that enable far more capabilities than a standard `BlockEntityBehaviour`.

These are (ideally) able to do anything a normal block entity can do full tick lifecycle, rendering, kinetic hooks, schematic requirements all packaged up into a single behaviour you can attach anywhere.

## Creating a behaviour

Extend `SuperBlockEntityBehaviour` the same way you would a regular `BlockEntityBehaviour`:

```java
public class MyCustomBehaviour extends SuperBlockEntityBehaviour {

    public static final BehaviourType<MyCustomBehaviour> TYPE = new BehaviourType<>();

    public MyCustomBehaviour(SmartBlockEntity be) {
        super(be);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }

    @Override
    public void initialize() {
        super.initialize();
        // called once after the block entity is placed and valid
    }

    @Override
    public void tick() {
        if (isClientLevel()) return;
        // server tick logic
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
public void addBehaviours(List<BlockEntityBehaviour> behaviours) {
    super.addBehaviours(behaviours);
    behaviours.add(new MyCustomBehaviour(this));
}
```

## Convenience helpers

`SuperBlockEntityBehaviour` bundles a few shorthand accessors so you don't have to reach into `blockEntity` everywhere:

| Method | Description |
| --- | --- |
| `getLevel()` | Returns the level the block entity is in. |
| `getBlockState()` | Returns the current `BlockState` at this position. |
| `getBlockEntity()` | Returns the owning `BlockEntity`. |
| `hasLevel()` | Returns `true` if the level is non-null. |
| `isClientLevel()` | Returns `true` if running on the client (Should be preceeded by a hasLevel check) |
| `isServerLevel()` | Returns `true` if running on the server (Should be preceeded by a hasLevel check) |
| `sendData()` | Syncs the owning block entity to clients. |

## Getting behaviours from other block entities

`SuperBlockEntityBehaviour` adds several typed helpers for looking up behaviours at arbitrary positions useful for multi-blocks, linked machines, etc.

### From a level + position

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

This is the pattern for multi-blocks getting the matching behaviour from the controller or a sub-part:

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

## Block break hook

Override `onBlockBroken` to react to the block being broken by a player (fired by NeoForge's `BlockEvent.BreakEvent`), useful for removing drops if the player is in creative:

```java
@Override
public void onBlockBroken(BlockEvent.BreakEvent event) {
    // handle drops, cleanup, etc.
}
```

## Using behaviour applicators

`BehaviourApplicators` is how you inject behaviours onto block entities you don't own no subclassing or mixins required.

### Global applicator

Registers a function that runs for *every* `SmartBlockEntity` when it collects its behaviours. Return `null` or an empty list to skip the entity:

```java
BehaviourApplicators.register(be -> {
    if (!(be instanceof MySpecificBlockEntity myBE)) return null;
    return List.of(new MyCustomBehaviour(myBE));
});
```

### Type-specific applicator

If you only care about one block entity type, use `registerForType` to avoid the overhead of checking every entity:

```java
BehaviourApplicators.registerForType(
    () -> MyBlockEntityType.MY_TYPE.get(),
    be -> List.of(new MyCustomBehaviour((MySpecificBlockEntity) be))
);
```

Type suppliers are resolved lazily, so it's safe to call this during mod construction before your registries are finalised.

> **Note:** `BehaviourApplicators` only works because Azimuth's mixins hook into `SmartBlockEntity`. Behaviours injected this way participate in the normal behaviour lifecycle (tick, initialize, destroy, etc.) exactly as if they'd been added from inside the block entity.

## Extensions

Behaviours can implement extension interfaces to opt into additional systems kinetics, rendering, schematic requirements. Extensions are checked by cached lookups, so only behaviours that actually implement a given extension incur any cost at all.

| Extension | Description |
| --- | --- |
| [`KineticBehaviourExtension`](./Kinetic Extension.md) | Adds propagation positions and rotation transfer overrides for kinetic networks. |
| [`RenderedBehaviourExtension`](./Rendered Extension.md) | Adds behaviour-level BER rendering, optional Flywheel visuals, and optional render bounds expansion. |
| [`ItemRequirementBehaviourExtension`](./Item Requirement Extension.md) | Adds per-behaviour item requirements to schematic requirement flows. |
