# Include Lang Defaults

`@IncludeLangDefaults` lets lang entries live right next to the code that uses them. Instead of maintaining a separate, monolithic lang provider, annotate the class or method that references a translation key and declare the English default inline. At datagen time Azimuth collects every annotated site across all mods on the classpath and writes the entries automatically.

## Why this matters

Traditional datagen lang providers force a single file to own every translation key in the mod. That means the creative tab name lives hundreds of lines away from the creative tab registration, goggle tooltip keys live far from the block entity that formats them, and so on. When a key is renamed or removed, the orphaned entry in the lang provider is easy to miss.

`@IncludeLangDefaults` removes that disconnect. The key, its English value, and the code that references it are all in the same place, making it immediately obvious when something is out of date.

## Basic usage

Annotate any class or method with `@IncludeLangDefaults` and supply one or more `@LangDefault` entries:

```java
@IncludeLangDefaults({
        @LangDefault(key = "tab.bits_n_bobs.base", value = "Bits 'n' Bobs"),
        @LangDefault(key = "tab.bits_n_bobs.deco", value = "Bits 'n' Bobs' Block Palettes"),
})
public class BnbCreativeTabs {
    // creative tab registration that references "tab.bits_n_bobs.base" etc.
}
```

Each `@LangDefault` entry has three fields:

| Field | Required | Description |
| --- | --- | --- |
| `key` | Yes | The translation key, e.g. `"goggle.flywheel_bearing.energy"`. |
| `value` | Yes | The default English text for that key. |
| `format` | No | A `String.format` template applied to the key before registration. The raw `key` is passed as the first argument. |

When `format` is empty (the default), the key is used as-is. When set, the final key becomes `String.format(format, key)`, which is useful for families of keys that share a common prefix pattern.

## Placing on classes vs methods

The annotation targets both `ElementType.TYPE` and `ElementType.METHOD`, so it can go wherever the key is most relevant.

**Class-level** — good for keys that belong to the class as a whole:

```java
@IncludeLangDefaults({
        @LangDefault(key = "goggle.flywheel_bearing.energy", value = "Stored Energy"),
        @LangDefault(key = "goggle.flywheel_bearing.capacity", value = "Capacity"),
})
public class FlywheelBearingBlockEntity extends KineticBlockEntity {
    // ...
}
```

**Method-level** — good for co-locating a key with the exact method that formats it:

```java
public class MyBlockEntity extends SmartBlockEntity {

    @IncludeLangDefaults(@LangDefault(key = "mymod.status.active", value = "Active"))
    public void addToGoggleTooltip(List<Component> tooltip, boolean isPlayerSneaking) {
        tooltip.add(Component.translatable("mymod.status.active"));
    }
}
```

## Mod ID auto-detection

When the `modid` field is left empty (the default), the collector determines the owning mod automatically. It does this by comparing the annotated class's package against every `@Mod` entry point on the classpath and picking the one whose package is the longest prefix match.

For example, if a class lives in `com.cake.bitsnbobs.content.tabs` and the mod's `@Mod` class is `com.cake.bitsnbobs.BitsNBobs`, the package `com.cake.bitsnbobs` is the best match, and the mod ID declared in that `@Mod` annotation is used.

This means most annotations need nothing beyond the key and value — the mod ID is inferred from context.

### Explicit `modid` override

If auto-detection picks the wrong mod (e.g. a shared library package that is a prefix of multiple mods), set the mod ID explicitly:

```java
@IncludeLangDefaults(modid = "bits_n_bobs", value = {
        @LangDefault(key = "special.shared_key", value = "Shared Value"),
})
public class SharedLibraryHelper {
    // ...
}
```

> If auto-detection fails entirely — no `@Mod` class shares a package tree with the annotated class — Azimuth logs a warning and skips those entries. Setting `modid` explicitly resolves this.

### Manual package registration

If you define lang defaults in a package outside your typical mod package, call `AzimuthModPackages.registerPackageModId(...)`, though it is unlikely you will need to do so.

```java
// During mod construction or initialisation
AzimuthModPackages.registerPackageModId("com.example.sharedlib", "my_mod");
```

Manual registrations are checked with the same longest-prefix-match algorithm as `@Mod` scanning and take priority when prefix lengths are equal.

## Using `format` for key templates

The `format` field applies `String.format(format, key)` to produce the final translation key. This is handy when a family of keys follows a repeating pattern:

```java
@IncludeLangDefaults({
        @LangDefault(key = "energy",  value = "Stored Energy", format = "goggle.flywheel_bearing.%s"),
        @LangDefault(key = "capacity", value = "Capacity",     format = "goggle.flywheel_bearing.%s"),
})
public class FlywheelBearingBlockEntity extends KineticBlockEntity { }
```

Here both keys resolve to `goggle.flywheel_bearing.energy` and `goggle.flywheel_bearing.capacity` respectively, keeping the annotation compact when many keys share a common prefix.

## How collection works

`LangDefaultCollector.collectAll()` runs during datagen. It iterates every mod's `ModFileScanData`, pulls out all `@IncludeLangDefaults` annotations on both types and methods, sorts them deterministically by class name then member name, and registers each resolved key/value pair into Azimuth's generated lang entry system. Mod ID resolution is handled by `AzimuthModPackages.detectModIdFromPackage()`, which checks manual registrations first, then falls back to `@Mod` annotation scanning.

Because collection is scan-data-driven, there is no manual registration step. Any class or method on the classpath that carries the annotation is picked up automatically.

## Datagen setup

`AzimuthGeneratedLangProvider` must be added to the mod's datagen for collected entries to be written to lang files. Without it, annotated keys are scanned but never output.

```java
@SubscribeEvent
public static void gatherData(final GatherDataEvent event) {
    event.getGenerator().addProvider(
            event.includeClient(),
            new AzimuthGeneratedLangProvider(event.getGenerator().getPackOutput())
    );
}
```

> See [Getting Started — Datagen](./Getting%20Started.md#datagen) for full context.
