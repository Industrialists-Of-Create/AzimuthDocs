# Goggle API

Azimuth provides a declarative API for Create goggle overlays via `IBuildGoggleInformation` and `GoggleBuilder`.

## Core Flow

1. Implement `IBuildGoggleInformation` on your Block Entity.
2. Return your mod id from `getModId()`.
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
- `conditional(...)`, `isSneaking()`, `isNotSneaking()`

Styling chain hierarchy:

- `LabelGoggleBuilder` -> `withLabelColor(...)`
- `StatisticGoggleBuilder` -> `withStatisticColor(...)`
- style-specific builders such as `BarChartGoggleBuilder`

## Built-in Styles

Azimuth includes presets:

- `CreateGoggleStyles` (`SU`, `RPM`, `MB`)
- `AzimuthGoggleStyles` (`CUG_GRAM`, `CUG_GRAM_M2`, `CUG_GRAM_M3`, `BAR_UNIT`, and chart presets)

## Datagen

The language registry collects keys through datagen scan and writes discovered tooltip entries.

A reference test implementation is available in Azimuth's `testmod` project with `MagicTankBlockEntity` and datagen verification provider.
