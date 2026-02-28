# Advancements

Azimuth provides a Create-compatible advancement system that closely mirrors how Create handles its own advancements internally. The goal is to let addon authors define and award advancements without having to wire up all the boilerplate themselves and, importantly, without needing to know Create's internals.

There are three main classes involved:

| Class | Role |
| --- | --- |
| `AzimuthAdvancementProvider` | Central registry for a mod's advancements. Handles datagen and lang generation. |
| `AzimuthAdvancement` | A single advancement definition icon, title, description, trigger, parent. |
| `AzimuthAdvancementBehaviour` | A `BlockEntityBehaviour` for tracking and awarding advancements from block entities. |


## Setting up `AzimuthAdvancementProvider`

Create one static `AzimuthAdvancementProvider` for your mod and define all your advancements on it:

```java
public class MyAdvancements {

    public static final AzimuthAdvancementProvider PROVIDER =
        new AzimuthAdvancementProvider(MyMod.MOD_ID, "My Mod Advancements");

    public static final AzimuthAdvancement ROOT = PROVIDER.create("root", b -> b
        .icon(MyItems.MY_ITEM)
        .title("My Mod")
        .description("Get started with My Mod.")
        .after(() -> AllAdvancements.ROOT) // display inside the Create tab omit to create a new advancement tab
        .awardedForFree()                  // immediately award when the player first joins
        .special(AzimuthAdvancement.TaskType.SILENT)
    );

    public static final AzimuthAdvancement FIRST_CRAFT = PROVIDER.create("first_craft", b -> b
        .icon(MyItems.MY_ITEM)
        .title("First Steps")
        .description("Craft your first widget.")
        .after(ROOT)
        .whenItemCollected(MyItems.MY_ITEM)
    );
}
```

Then wire it into datagen. Call `register()` during common mod init, then hook `provideLang` and `dataProvider` into your datagen event:

```java
// In your mod class or init method
MyAdvancements.PROVIDER.register();

// In your GatherDataEvent handler
public static void gatherData(final GatherDataEvent event) {
    final PackOutput output = event.getGenerator().getPackOutput();
    final CompletableFuture<HolderLookup.Provider> lookupProvider = event.getLookupProvider();

    YourMod.REGISTRATE.addDataGenerator(ProviderType.LANG, provider -> {
        final BiConsumer<String, String> langConsumer = provider::add;
        MyAdvancements.PROVIDER.provideLang(langConsumer);
    });

    event.getGenerator().addProvider(
        event.includeServer(),
        MyAdvancements.PROVIDER.dataProvider(output, lookupProvider)
    );
}
```


## Advancement builder options

The builder passed to `PROVIDER.create(...)` supports the following:

### Icon

```java
.icon(MyItems.MY_ITEM)           // ItemProviderEntry<?, ?>
.icon(Items.IRON_INGOT)          // ItemLike
.icon(new ItemStack(Items.BOOK)) // ItemStack, for NBT-specific icons
```

### Title and description

```java
.title("My Advancement Title")
.description("A short description shown in the advancement screen.")
```

Lang keys are automatically generated as `advancement.<modid>.<id>` and `advancement.<modid>.<id>.desc`.

### Parent

Chain advancements by passing the parent definition:

```java
.after(ROOT)                                        // AzimuthAdvancement
.after(AllAdvancements.ANDESITE_ALLOY)              // CreateAdvancement
.after(ResourceLocation.fromNamespaceAndPath(...))  // raw ResourceLocation
```

Leave out `.after(...)` entirely for the root advancement of your tree (its background texture is expected at `textures/gui/advancements.png` in your mod namespace).

### Task type

```java
.special(AzimuthAdvancement.TaskType.NORMAL)  // default
```

| Type | Toast | Announce | Hidden |
| --- | --- | --- | --- |
| `SILENT` | No | No | No |
| `NORMAL` | Yes | No | No |
| `NOISY` | Yes | Yes | No |
| `EXPERT` | Yes | Yes | No |
| `SECRET` | Yes | Yes | Yes |

`SECRET` also appends a "Hidden Advancement" suffix to the description automatically.

### Triggers

If you want the advancement to be awarded by a game event (rather than manually), use one of the built-in trigger helpers:

```java
.whenBlockPlaced(MyBlocks.MY_BLOCK.get())       // placed a specific block
.whenItemCollected(MyItems.MY_ITEM)             // item entered inventory
.whenItemCollected(MyTags.Items.MY_TAG)         // tag variant
.whenIconCollected()                            // shorthand for the icon item
.awardedForFree()                               // always awarded (useful for roots)
.externalTrigger(myCriterion)                   // raw Criterion<?> for anything else
```

If none of these are called, a built-in `SimpleCreateTrigger` is created automatically. You can then award the advancement manually (see below).


## Awarding advancements manually

If the advancement uses the built-in trigger (no `.whenX` call), award it directly:

```java
MyAdvancements.FIRST_CRAFT.awardTo(player);
```

You can also check whether a player already has it:

```java
if (!MyAdvancements.FIRST_CRAFT.isAlreadyAwardedTo(player)) {
    // do something
}
```

`awardTo` will throw `UnsupportedOperationException` if the advancement uses an external trigger.


## `AzimuthAdvancementBehaviour`

If you want a block entity to track a player and award advancements when they interact with it, add `AzimuthAdvancementBehaviour` to its behaviour list:

```java
@Override
public void addBehaviours(List<BlockEntityBehaviour> behaviours) {
    super.addBehaviours(behaviours);
    AzimuthAdvancementBehaviour.create(behaviours, this,
        MyAdvancements.FIRST_CRAFT,
        MyAdvancements.ANOTHER_ONE
    );
}
```

Using the static `create` method (rather than constructing directly) means that if multiple callers add the behaviour, they'll merge into a single instance rather than duplicate.

### Tracking the player

Call `setPlacedBy` from your block's `setPlacedBy` override to register the player who placed it:

```java
@Override
public void setPlacedBy(Level level, BlockPos pos, BlockState state, LivingEntity placer, ItemStack stack) {
    super.setPlacedBy(level, pos, state, placer, stack);
    AzimuthAdvancementBehaviour.setPlacedBy(level, pos, placer);
}
```

Fake players are ignored automatically.

### Awarding from the behaviour

```java
// Award if the player is within maxDistance blocks
behaviour.awardPlayerIfNear(MyAdvancements.FIRST_CRAFT, 8);

// Award unconditionally
behaviour.awardPlayer(MyAdvancements.FIRST_CRAFT);
```

Or use the static shorthand if you only have a position:

```java
AzimuthAdvancementBehaviour.tryAward(level, pos, MyAdvancements.FIRST_CRAFT);
```

Already-awarded advancements are pruned from the behaviour's tracked set automatically. Once all tracked advancements for a player have been awarded, the player reference is cleared.
