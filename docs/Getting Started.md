# Getting Started

Azimuth is a Create addon library focused on making it easier to extend the functionality of Create.

## Adding Azimuth to your project

Add the following to your `build.gradle` dependencies block, replacing `<version>` with the version you want to target, [the latest production-ready version is available here](https://modrinth.com/project/azimuth-api/settings/versions):

```groovy
dependencies {
    implementation "com.cake.azimuth:azimuth:<version>"
}
```

You may also need to declare Azimuth as a required dependency in your `neoforge.mods.toml`:

```toml
[[dependencies.yourmodid]]
    modId = "azimuth"
    type = "required"
    versionRange = "[<version>,)"
    ordering = "AFTER"
    side = "BOTH"
```

Azimuth doesn't require any explicit initialisation on your part just depend on it and start using the APIs.

## What's available

### Super Block Entity Behaviours

An expanded version of Create's `BlockEntityBehaviour` that can do significantly more, in effort to replicate features that would typically take new block entity types. All of which is composable on a single `SmartBlockEntity`. You can also *inject* behaviours onto block entities you don't own, without touching their source, making simple soft-compatability easy.

[Super Block Entity Behaviours](./Super Behaviours/Super Behaviours.md)

### Advancements

A thin wrapper around Create's internal advancement machinery. Define advancements in the same style Create uses, generate the required data, and award them from anywhere including from a block entity via `AzimuthAdvancementBehaviour`.

[Advancements](./Advancements/Advancements.md)

### Outlines

Extra outline types built on top of Catnip's outliner. Particularly handy for ponders.

[Outlines](./Outlines/Outlines.md)
