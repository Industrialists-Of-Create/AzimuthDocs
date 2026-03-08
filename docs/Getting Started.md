# Getting Started

Azimuth is a Create addon library focused on making it easier to extend Create without forking large chunks of block entity or registration code.

## Adding Azimuth to your project

Add the following to the `build.gradle` dependencies block, replacing `<version>` with the version to target. [The latest production-ready version is available here](https://modrinth.com/project/azimuth-api/settings/versions):

```groovy
dependencies {
    implementation "com.cake.azimuth:azimuth:<version>"
}
```

It may also be necessary to declare Azimuth as a required dependency in `neoforge.mods.toml`:

```toml
[[dependencies.yourmodid]]
    modId = "azimuth"
    type = "required"
    versionRange = "[<version>,)"
    ordering = "AFTER"
    side = "BOTH"
```

Most Azimuth APIs are ready as soon as the dependency is present. The one setup pattern worth knowing is behaviour and visual registration.

## Recommended common setup

If a mod registers type-specific behaviour applicators or Flywheel visual interest predicates, resolve them during common setup once the registries exist:

```java
public MyMod(final IEventBus modEventBus) {
    MyBehaviourApplicators.register();
    modEventBus.addListener(MyMod::commonSetup);
}

private static void commonSetup(final FMLCommonSetupEvent event) {
    BehaviourApplicators.resolveRegisteredTypes();
    VisualWrapperInterest.resolve();
}
```

`BehaviourApplicators.resolveRegisteredTypes()` is relevant for `registerForType(...)` suppliers. `VisualWrapperInterest.resolve()` is only relevant for `RenderedBehaviourExtension` visuals created through `getVisualFactory()`. Plain BER rendering does not need it.

## What's available

### Super Block Entity Behaviours

An expanded version of Create's `BlockEntityBehaviour` with full tick lifecycle support, extra interaction hooks, typed lookup helpers, and extension interfaces for rendering, kinetics, and schematic requirements. Behaviours can also be injected onto block entities that are not owned by the mod.

[Super Block Entity Behaviours](./Super%20Behaviours/Super%20Behaviours.md)

### Create Block Edits

A registration-time API for soft-modding Create's own blocks. Use it to apply extra `BlockBuilder` transforms or replace the generated `BlockItem` for an existing Create block id.

[Create Block Edits](./Create%20Block%20Edits.md)

### Advancements

A thin wrapper around Create's internal advancement machinery. Define advancements in the same style Create uses, generate the required data, and award them from anywhere including from a block entity via `AzimuthAdvancementBehaviour`.

[Advancements](./Advancements/Advancements.md)

### Goggle API

A declarative builder for Create goggle tooltips, including labels, statistics, preset styles, and language key collection for datagen.

[Goggle API](./Goggle%20API/Goggle%20API.md)

### Outlines

Extra outline types built on top of Catnip's outliner. Particularly handy for ponders.

[Outlines](./Outlines/Outlines.md)
