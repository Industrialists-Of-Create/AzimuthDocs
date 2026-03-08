# RenderedBehaviourExtension

`RenderedBehaviourExtension` lets a behaviour contribute rendering output alongside the block entity it is attached to. Two rendering paths are available: a standard Block Entity Renderer (BER) that always works, and an optional Flywheel visual for hardware-accelerated rendering.

For an overview of all extensions, see [Super Block Entity Behaviours](../Super%20Behaviours.md#extensions).

## Implementing

To use a renderer, it is suggested you create a public static final supplier instance, which functions as a singleton for the renderer factory. This is not strictly required, but it is more efficient to reuse the same supplier instance across all behaviour instances than to create a new one for each:

```java
public class MyRenderedBehaviour extends SuperBlockEntityBehaviour
        implements RenderedBehaviourExtension {

    public static final BehaviourType<MyRenderedBehaviour> TYPE = new BehaviourType<>();
    public static final BehaviourRenderSupplier RENDERER = () -> MyBehaviourRenderer::new;

    public MyRenderedBehaviour(final SmartBlockEntity be) {
        super(be);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }

    @Override
    public BehaviourRenderSupplier getRenderer() {
        return RENDERER;
    }
}
```

## Block Entity Renderer (BER)

### `getRenderer()`

Required. Returns a `BehaviourRenderSupplier`, which produces a new `BlockEntityBehaviourRenderer` instance when Azimuth needs one.

```java
public class MyBehaviourRenderer extends BlockEntityBehaviourRenderer<MyBlockEntity> {
    @Override
    public void renderSafe(final SuperBlockEntityBehaviour behaviour, final MyBlockEntity blockEntity,
                           final float partialTicks, final PoseStack ms, final MultiBufferSource buffer,
                           final int light, final int overlay) {
        // render here
    }
}
```

The type parameter `T` controls the type of the `blockEntity` argument. If the cast fails at runtime, Azimuth throws an informative `ClassCastException`.

### `rendersWhenVisualizationAvailable()`

Controls whether the BER still runs when a Flywheel visual is active for the same block entity. The default is `true`. Return `false` when the visual fully replaces the BER output.

### `getRenderBoundingBox()`

Optional. Return an `AABB` to expand the culling bounds for the owning block entity. Returning `null` leaves the bounds unchanged.

> If a `RenderedBehaviourExtension` is attached after the block entity has already been rendered, call `((CachedRenderBBBlockEntity) blockEntity).invalidateRenderBoundingBox()` to force a client-side refresh.

## Flywheel Visual Interest

Flywheel visuals are injected through a wrapping visualizer. Register interest only for the block entity types that might actually create a behaviour visual:

```java
public static void register() {
    VisualWrapperInterest.registerInterest(type ->
        type == MyBlockEntityType.MY_TYPE.get()
    );
}

private static void commonSetup(final FMLCommonSetupEvent event) {
    VisualWrapperInterest.resolve();
}
```

## Flywheel Visual

### `getVisualFactory()`

Optional. Return a `BehaviourVisualFactory` to attach a Flywheel visual to this behaviour. Return `null` to skip the visual path entirely.

```java
@Override
public BehaviourVisualFactory getVisualFactory() {
    return (context, behaviour, blockEntity, parentVisual, partialTick) -> {
        if (!(blockEntity instanceof final MyKineticBlockEntity kineticBlockEntity) || behaviour != this) {
            return null;
        }
        return new MyBehaviourVisual(parentVisual);
    };
}
```

That guard pattern is useful when only some block entities attached to a behaviour can actually build the visual.

### Implementing `BehaviourVisual`

Extend `RenderedBehaviourExtension.BehaviourVisual` and implement `delete()`. The other lifecycle hooks are optional:

```java
public class MyBehaviourVisual extends RenderedBehaviourExtension.BehaviourVisual {

    // Flywheel instances here

    public MyBehaviourVisual(final AbstractBlockEntityVisual<?> parentVisual) {
        super(parentVisual);
    }

    @Override
    public void update(final float partialTick) {
        // update instance transforms
    }

    @Override
    public void updateLight(final float partialTick) {
        // update instance lighting
    }

    @Override
    public void collectCrumblingInstances(final Consumer<Instance> consumer) {
        // feed instances into the block-breaking animation
    }

    @Override
    public void delete() {
        // delete all instances
    }
}
```

Use `getVisualPosition()` from `BehaviourVisual` to place instances at the owning block entity's visual position.
