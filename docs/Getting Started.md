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

## Datagen

Azimuth uses `AzimuthGeneratedLangProvider` to write all collected lang entries to lang files at datagen time. This covers keys declared via [`@IncludeLangDefaults`](./Include%20Lang%20Defaults.md) annotations and keys registered through the [Goggle Builder](./Goggle%20Builder/Goggle%20Builder.md)'s `component()` helper.

Any mod that uses either of these features needs to add the provider to its datagen:

```java
@SubscribeEvent
public static void gatherData(final GatherDataEvent event) {
    event.getGenerator().addProvider(
            event.includeClient(),
            new AzimuthGeneratedLangProvider(event.getGenerator().getPackOutput())
    );
}
```

> Without this provider, lang keys defined via annotations or the goggle builder won't be written to lang files.

## What's available

### Include Lang Defaults

An annotation-driven system for co-locating translation keys with the code that uses them. Place `@IncludeLangDefaults` on any class or method, declare the key and its English default inline, and Azimuth collects everything automatically at datagen time — no monolithic lang provider needed. Mod ID is auto-detected from the classpath.

[Include Lang Defaults](./Include%20Lang%20Defaults.md)

### Super Block Entity Behaviours

An expanded version of Create's `BlockEntityBehaviour` with full tick lifecycle support, extra interaction hooks, typed lookup helpers, and extension interfaces for rendering, kinetics, and schematic requirements. Behaviours can also be injected onto block entities that are not owned by the mod.

[Super Block Entity Behaviours](./Super%20Behaviours/Super%20Behaviours.md)

### Create Block Edits

A registration-time API for soft-modding Create's own blocks. Use it to apply extra `BlockBuilder` transforms or replace the generated `BlockItem` for an existing Create block id.

[Create Block Edits](./Create%20Block%20Edits.md)

### Advancements

A thin wrapper around Create's internal advancement machinery. Define advancements in the same style Create uses, generate the required data, and award them from anywhere including from a block entity via `AzimuthAdvancementBehaviour`.

[Advancements](./Advancements/Advancements.md)

### Goggle Builder

A declarative builder for Create goggle tooltips, including labels, statistics, preset styles, and language key collection for datagen.

[Goggle Builder](./Goggle%20Builder/Goggle%20Builder.md)

### Outlines

Extra outline types built on top of Catnip's outliner. Particularly handy for ponders.

[Outlines](./Outlines/Outlines.md)

### New Ponder Tooltip

A gold **(New!)** badge on item tooltips in the ponder progress bar when unwatched tutorial scenes exist for that item.

[New Ponder Tooltip](./New%20Ponder%20Tooltip.md)

### Foreign Ponder Labels

A microfont attribution label next to ponder scene titles when a mod injects scenes into another mod's items. Includes automatic fallback to Minecraft's font for non-Latin characters.

[Foreign Ponder Labels](./Foreign%20Ponder%20Labels.md)

## Debug Commands

Azimuth registers client-side commands under `/azimuth` for development and debugging:

- `/azimuth tooltip_debug <true|false>` — Toggles goggle tooltip builder debug info.
- `/azimuth mod_package list` — Lists all detected mod IDs and their root packages (from `@Mod` annotation scanning).
- `/azimuth mod_package get <mod_id>` — Shows the package and entry class for a specific mod ID.
