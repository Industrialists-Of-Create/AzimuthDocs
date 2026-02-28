# KineticBehaviourExtension

`KineticBehaviourExtension` lets a behaviour participate in kinetic propagation adding extra neighbour positions and overriding the speed that gets propagated. It assumes the block entity this behaviour is attached to is a `KineticBlockEntity`.

For an overview of all extensions, see [Super Block Entity Behaviours](./Super Behaviours.md#extensions).

## Implementing

```java
public class MyKineticBehaviour extends SuperBlockEntityBehaviour
        implements KineticBehaviourExtension {

    public static final BehaviourType<MyKineticBehaviour> TYPE = new BehaviourType<>();

    public MyKineticBehaviour(SmartBlockEntity be) {
        super(be);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }
}
```

`getBlockEntity()` is already implemented by `SuperBlockEntityBehaviour`, so there's nothing extra to add.


## Methods

### `addExtraPropagationLocations`

Called during kinetic propagation so you can append (or modify) the list of neighbours considered. The default just returns the list unchanged.

```java
@Override
public List<BlockPos> addExtraPropagationLocations(IRotate block, BlockState state, List<BlockPos> neighbours) {
    // Add an extra attachment point one block to the side
    neighbours.add(getPos().offset(1, 0, 0));
    return neighbours;
}
```

### `propagateRotationTo`

Provides a *base-level* rotation value for propagation to a given neighbour. Return `0` to defer to whatever the block entity would normally produce. Use this when you want to suggest a fallback speed without unconditionally overriding.

```java
@Override
public float propagateRotationTo(KineticBlockEntity target, BlockState stateFrom, BlockState stateTo,
                                  BlockPos diff, boolean connectedViaAxes, boolean connectedViaCogs) {
    return 16f; // suggest 16 RPM as the base if nothing else wants to provide one
}
```

### `forcePropagateRotationTo`

Like `propagateRotationTo`, but takes priority over whatever the block entity itself wants to propagate. Return `0` for no effect.

```java
@Override
public float forcePropagateRotationTo(KineticBlockEntity target, BlockState stateFrom, BlockState stateTo,
                                       BlockPos diff, boolean connectedViaAxes, boolean connectedViaCogs) {
    return overrideSpeed; // always propagate exactly this speed, regardless of the block entity
}
```


## Utility methods

These are convenience wrappers around the underlying `KineticBlockEntity`, provided directly on the interface:

| Method | Description |
| --- | --- |
| `detachKinetics()` | Detaches the block entity from its kinetic network. |
| `attachKinetics()` | Re-attaches the block entity to its kinetic network. |
| `repropagateKinetics()` | Detaches and marks the block entity for re-propagation on next tick. |

All three throw `IllegalStateException` if the owning block entity is not a `KineticBlockEntity`.
