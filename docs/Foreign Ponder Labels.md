# Foreign Ponder Labels

When a mod injects ponder scenes into another mod's items, a small attribution label can appear next to the scene title, rendered in Azimuth's microfont. Labels only show when the scene's namespace differs from the pondered item's namespace, so a mod's own scenes stay clean.

## Registering a label

Call `PonderForeignLabelRegistry.register` during client init, alongside any other ponder registration:

```java
import com.cake.azimuth.ponder.PonderForeignLabelRegistry;

// Plain string — rendered in microfont (A–Z only)
PonderForeignLabelRegistry.register("bits_n_bobs", "BITS N BOBS");
```

The first argument is the mod's namespace (the one used when registering ponder scenes). The second is the label text, automatically uppercased.

### Localised labels

For languages that need characters outside the microfont charset (CJK, Cyrillic, accented Latin, digits, etc.), pass a `Component` instead:

```java
import net.minecraft.network.chat.Component;

PonderForeignLabelRegistry.register(
    "bits_n_bobs",
    Component.translatable("bits_n_bobs.ponder.label") // resolved at render time
);
```

When any character in the resolved string falls outside the microfont's glyph set, Azimuth automatically falls back to Minecraft's built-in font scaled to match the microfont size. The switch is all-or-nothing per label — no mixing of fonts within a single string.

> The microfont charset is **A–Z**, **<**, **>**, **/**, and **space**. Anything else triggers the fallback.

## Microfont

The microfont is a 3×4 pixel spritesheet font available for general use beyond ponder labels. Static methods live on `Microfont`:

| Method | Description |
|---|---|
| `render(GuiGraphics, String, x, y, color)` | Sprite-only render — unsupported chars produce blank gaps |
| `renderHighlighted(GuiGraphics, String, x, y, color, bgColor)` | Same as above with a filled background rectangle |
| `renderSmart(GuiGraphics, Font, String, x, y, color)` | Auto-detects charset; falls back to MC font at 0.5× scale |
| `calculateWidth(String)` | Pixel width using sprite metrics |
| `calculateSmartWidth(Font, String)` | Width accounting for possible fallback font |

Custom font sheets can be created with `FontSheet.Builder` for different textures or glyph sets.
