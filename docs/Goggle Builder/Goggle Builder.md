# Goggle Builder

Azimuth provides a declarative builder for Create goggle overlays via `IBuildGoggleInformation` and `GoggleBuilder`.

## Core Flow

1. Implement `IBuildGoggleInformation` on your Block Entity.
2. Mod ID is auto-detected from your implementing class's package. Override `getModId()` if you need a different value.
3. Build tooltip structure in `buildGoggleStructure(GoggleBuilder builder)`.

## Components

Use `GoggleBuilderHelper` for reusable keys:

- `component(keySuffix, defaultEnglish)` registers a datagen-visible key under `<modid>.tooltip.<keySuffix>`.
- `component(fullTranslationKey)` references an existing absolute translation key.
- `provideLang(langConsumer)` iterates over collected components for datagen.

## Builder Structure

`GoggleBuilder` supports:

- `section(...)`
- `label(...)`
- `statistic(...)`
- `conditional(...)`, `isSneaking()`, `isNotSneaking()`, `endConditional()`

Styling chain hierarchy:

- `LabelGoggleBuilder` -> `withLabelColor(...)`
- `StatisticGoggleBuilder` -> `withStatisticColor(...)`
- style-specific builders such as `BarChartGoggleBuilder`

## Built-in Styles

Azimuth includes presets:

- `CreateGoggleStyles` (`SU`, `RPM`, `MB`)
- `AzimuthGoggleStyles` (`CUG_GRAM`, `CUG_GRAM_M2`, `CUG_GRAM_M3`, `PINK_BAR`, `RED_GREEN_BAR`, `BLUE_BAR`)

## Datagen

The language registry collects keys through datagen scan and writes discovered tooltip entries. For these keys to actually be written to lang files, `AzimuthGeneratedLangProvider` must be registered in datagen:

```java
@SubscribeEvent
public static void gatherData(final GatherDataEvent event) {
    event.getGenerator().addProvider(
            event.includeClient(),
            new AzimuthGeneratedLangProvider(event.getGenerator().getPackOutput())
    );
}
```

> See [Getting Started — Datagen](../Getting%20Started.md#datagen) for full context.

A reference test implementation is available in Azimuth's `testmod` project with `MagicTankBlockEntity` and datagen verification provider.
