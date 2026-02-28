# ItemRequirementBehaviourExtension

`ItemRequirementBehaviourExtension` lets a behaviour contribute item requirements to Create's schematic placement flow. Implement this if your behaviour places or represents items that should be listed when a player is deploying a schematic containing this block.

For an overview of all extensions, see [Super Block Entity Behaviours](./Super Behaviours.md#extensions).

## Implementing

```java
public class MyBehaviour extends SuperBlockEntityBehaviour
        implements ItemRequirementBehaviourExtension {

    public static final BehaviourType<MyBehaviour> TYPE = new BehaviourType<>();

    public MyBehaviour(SmartBlockEntity be) {
        super(be);
    }

    @Override
    public BehaviourType<?> getType() {
        return TYPE;
    }

    @Override
    public ItemRequirement getRequiredItems(BlockState state) {
        return new ItemRequirement(
            ItemRequirement.ItemUseType.CONSUME,
            List.of(new ItemRequirement.StackRequirement(
                new ItemStack(MyItems.MY_ITEM.get()),
                ItemRequirement.ItemUseType.CONSUME
            ))
        );
    }
}
```

Return `ItemRequirement.NONE` if no items are required in the current state, or `ItemRequirement.INVALID` if the structure cannot be placed at all.
