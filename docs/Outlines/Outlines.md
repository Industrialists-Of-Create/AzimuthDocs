# Outlines

Azimuth adds extra outline types built on top of Catnip's `LineOutline`. These are particularly useful in ponders, where animated visual cues help guide the player's attention.

## `ExpandingLineOutline`

A `LineOutline` that animates from its midpoint outward, expanding to full length over a configurable number of ticks. The expansion uses an ease-out cubic curve, so it decelerates naturally as it reaches full size.

```java
ExpandingLineOutline outline = new ExpandingLineOutline();
outline
    .setGrowingTicks(10)        // how many ticks the expansion takes
    .set(start, end)            // Vec3 start and end points
    .setGrowingTicksElapsed(0); // tick counter increment each tick to drive the animation
```

Call `tickGrowingTicksElapsed()` each tick to advance the animation. Once elapsed reaches `growingTicks`, the outline stays at full size.

## `ExpandingOutlineInstruction`

A ready-to-use Ponder `TickingInstruction` that wraps `ExpandingLineOutline`. Line width defaults to `1/16f` but can be configured via an optional constructor parameter.

```java
scene.addInstruction(new ExpandingOutlineInstruction(
    PonderPalette.WHITE,         // color palette
    new Vec3(0.5, 1.0, 0.5),    // start point
    new Vec3(2.5, 1.0, 0.5),    // end point
    40,                          // total duration in ticks
    10                           // growing ticks — how long the expand animation takes
));
```

To use a custom line width, pass it as the last argument:

```java
scene.addInstruction(new ExpandingOutlineInstruction(
    PonderPalette.WHITE,
    new Vec3(0.5, 1.0, 0.5),
    new Vec3(2.5, 1.0, 0.5),
    40,
    10,
    1 / 8f                       // custom line width (default is 1/16f)
));
```
