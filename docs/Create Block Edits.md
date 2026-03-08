# Create Block Edits

`CreateBlockEdits` lets a mod adjust Create's own block registrations while `AllBlocks` is still being built. That makes it possible to soft-mod existing Create blocks, add extra builder transforms, or swap the generated `BlockItem` class without replacing the block itself.

## Registering edits

Declare a public static no-arg method, annotate it with `@CreateBlockEdits.Registrator`, and register edits inside it:

```java
public class MyCreateBlockEdits {

    public static final BooleanProperty GLOWING = BooleanProperty.create("glowing");

    @CreateBlockEdits.Registrator
    public static void register() {
        CreateBlockEdits.forBlock("belt", builder ->
            builder.properties(p -> p.emissiveRendering(
                (state, level, pos) -> state.hasProperty(GLOWING) && state.getValue(GLOWING)
            ))
        );

        CreateBlockEdits.forBlockItem("fluid_pipe", MyDyeablePipeBlockItem::new);
    }
}
```

The string id is the original Create registration name, such as `belt` or `fluid_pipe`.

## API overview

| API | Description |
| --- | --- |
| `@CreateBlockEdits.Registrator` | Marks a `public static void register()` method for automatic discovery during Create block bootstrap. |
| `CreateBlockEdits.forBlock(id, edit)` | Applies an extra transform to Create's original `BlockBuilder` for that id. |
| `CreateBlockEdits.forBlockItem(id, factory)` | Replaces the generated `BlockItem` factory for that id. |

## `@CreateBlockEdits.Registrator`

Registrator methods are discovered automatically from NeoForge scan data when Create's `AllBlocks` class starts bootstrapping. No manual bootstrap call is required from mod setup.

The method signature is strict:

```java
@CreateBlockEdits.Registrator
public static void register() {
    // edits go here
}
```

Anything else, such as private methods, instance methods, parameters, or a non-`void` return type, throws an `IllegalStateException` during discovery.

## `forBlock(...)`

`forBlock(...)` exposes the original `BlockBuilder<?, CreateRegistrate>` so extra registration transforms can be layered onto Create's own block definition.

```java
CreateBlockEdits.forBlock("belt", builder ->
    builder.properties(p -> p.noOcclusion())
);
```

Multiple edits for the same id are merged and run in registration order. This makes it practical for separate compat modules to contribute independent builder changes to the same Create block.

## `forBlockItem(...)`

`forBlockItem(...)` replaces the generated item factory for a Create block, generally for when blocks dont have an explicit item themselves.

```java
CreateBlockEdits.forBlockItem("fluid_pipe", MyDyeablePipeBlockItem::new);
```

Only one item override may exist for a given block id. Registering a second one for the same id throws an `IllegalStateException`. This makes block items mutually exclusive to use with multiple edits on the same block, so should only be used when item classes dont exist and cannot have mixins.

## Timing rules

> `forBlock(...)` and `forBlockItem(...)` only work while a `@CreateBlockEdits.Registrator` method is running. Calling them later throws an `IllegalStateException` because the Create registration window is already closed.

Azimuth opens that window automatically from a mixin on Create's `AllBlocks` bootstrap, then applies the collected block edits and item overrides as the original Create registrations are created.

## Case study use cases

`Create: Bits 'n' Bobs` uses `CreateBlockEdits` in two practical ways:

- `forBlock("belt", ...)` adds emissive rendering to Create's belt block when the custom `glowing` property is enabled, which then gets external handling to add the interaction check.
- `forBlockItem("fluid_pipe", ...)` swaps the normal pipe item for `DyeablePipeBlockItem`, which carries the extra placement behavior used by the dyeable pipe system, since pipes dont have their own item class to mixin into.

That is the intended pattern when the base Create block should stay intact but its registration-time properties or generated item class need to change.
