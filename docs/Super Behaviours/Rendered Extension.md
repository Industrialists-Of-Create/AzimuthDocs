# RenderedBehaviourExtension

`RenderedBehaviourExtension` lets a behaviour contribute rendering output alongside the block entity it's attached to. There are two rendering paths available: a standard Block Entity Renderer (BER) that works unconditionally, and an optional Flywheel visual for hardware-accelerated rendering. You can use either path or both together.

For an overview of all extensions, see [Super Block Entity Behaviours](./Super Behaviours.md#extensions).

## Implementing

```java
public class MyRenderedBehaviour extends SuperBlockEntityBehaviour
        implements RenderedBehaviourExtension {

    public static final BehaviourType<MyRenderedBehaviour> TYPE = new BehaviourType<>();

    public MyRenderedBehaviour(SmartBlockEntity be) {
        super(be);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }

    @Override
    public BehaviourRenderSupplier getRenderer() {
        return () -> () -> new MyBehaviourRenderer();
    }
}
```


## Block Entity Renderer (BER)

### `getRenderer()`

**Required.** Returns a `BehaviourRenderSupplier` a double-supplier that produces a new `BlockEntityBehaviourRenderer` instance. The renderer's `renderSafe` method is called each frame while the block entity is in view.

```java
public class MyBehaviourRenderer extends BlockEntityBehaviourRenderer<MyBlockEntity> {
    @Override
    public void renderSafe(SuperBlockEntityBehaviour behaviour, MyBlockEntity blockEntity,
                           float partialTicks, PoseStack ms, MultiBufferSource buffer,
                           int light, int overlay) {
        // your rendering here
    }
}
```

The type parameter `T` determines what the `blockEntity` argument is cast to. If the cast fails at runtime, an informative `ClassCastException` is thrown.

### `rendersWhenVisualizationAvailable()`

Controls whether the BER runs even when a Flywheel visual is also active for this block entity. Defaults to `true`. Override to return `false` if your BER and Flywheel visual would produce duplicate output and you only want the visual to run.

### `getRenderBoundingBox()`

Optional. Return an `AABB` to expand the culling bounding box for this block entity. Returning `null` (default) leaves it untouched.

> If you add a `RenderedBehaviourExtension` *after* the block entity has already been rendered (i.e. deferred), call `((CachedRenderBBBlockEntity) blockEntity).invalidateRenderBoundingBox()` to force a client-side refresh.


## Flywheel Visual Interest

Flywheel visuals from `RenderedBehaviourExtension` are injected via a wrapping visualizer. To keep the overhead minimal, you must explicitly declare which block entity types need the wrapper types that aren't registered are left untouched.

Call this once during client setup for any type that will host a behaviour using `getVisualFactory()`:

```java
VisualWrapperInterest.registerInterest(type ->
    type == MyBlockEntityType.MY_TYPE.get()
);
```

This is only required for the Flywheel visual path. Plain BER rendering works without it.


## Flywheel Visual

### `getVisualFactory()`

Optional. Return a `BehaviourVisualFactory` to attach a Flywheel visual to this behaviour. Return `null` (default) to skip the visual path entirely.

```java
@Override
public BehaviourVisualFactory getVisualFactory() {
    return (context, behaviour, blockEntity, parentVisual, partialTick) ->
        new MyBehaviourVisual(parentVisual);
}
```

### Implementing `BehaviourVisual`

Extend `RenderedBehaviourExtension.BehaviourVisual` and implement the required `delete()` method. The other lifecycle hooks are optional:

```java
public class MyBehaviourVisual extends RenderedBehaviourExtension.BehaviourVisual {

    // your Flywheel instances here

    public MyBehaviourVisual(AbstractBlockEntityVisual<?> parentVisual) {
        super(parentVisual);
    }

    @Override
    public void update(float partialTick) {
        // update instance transforms
    }

    @Override
    public void updateLight(float partialTick) {
        // update instance lighting
    }

    @Override
    public void collectCrumblingInstances(Consumer<Instance> consumer) {
        // feed your instances to the consumer for block-breaking animation
    }

    @Override
    public void delete() {
        // delete all instances
    }
}
```

Use `getVisualPosition()` (inherited from `BehaviourVisual`) to get the block position for placing instances.
