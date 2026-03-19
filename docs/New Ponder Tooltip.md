# New Ponder Tooltip

The New Ponder Tooltip system adds a gold **(New!)** badge to item tooltips in the ponder progress bar when there are unwatched ponder tutorial scenes for that item. Once all scenes are watched, the badge disappears automatically. This is useful for when theres content added into base create items that players would otherwise be unaware of.

> **Attribution**: The New Ponder Tooltip system was originally created by the Simulated project. Full credit goes to them for the original concept and implementation. This version has been adapted and tweaked for Azimuth.

## How it works

Items are registered alongside their associated ponder scene IDs. When the player hovers over an item, the system checks whether all registered scenes have been watched. If any remain unwatched, a gold badge is appended to the ponder progress bar in the tooltip.

Scene watch state is persisted to `ponders_watched_azimuth.json` in the game directory. On startup, the file is loaded once and cached; writes happen atomically so a crash mid-save cannot corrupt the data.

Before appending a badge, the system checks whether an identical badge already exists in the tooltip. This conflict detection prevents duplicate badges when multiple mods use similar tooltip systems.

## Registering items

Register items with their ponder scene IDs during mod initialization, alongside any other ponder scene registration:

```java
import com.cake.azimuth.ponder.newtooltip.NewPonderTooltipManager;
import net.minecraft.resources.ResourceLocation;

// Single item with one scene
NewPonderTooltipManager.forItems(MY_BLOCK.get().asItem())
    .addScenes(ResourceLocation.fromNamespaceAndPath("mymod", "my_scene_id"));
```

Multiple items can share the same set of scenes:

```java
NewPonderTooltipManager.forItems(ITEM_A, ITEM_B, ITEM_C)
    .addScenes(
        ResourceLocation.fromNamespaceAndPath("mymod", "scene_1"),
        ResourceLocation.fromNamespaceAndPath("mymod", "scene_2")
    );
```

Each `forItems(...)` call returns a builder. Calling `addScenes(...)` on the builder links those scene IDs to every item passed in, so the badge appears on all of them until every listed scene has been watched.
