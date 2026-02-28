# Style Guide

This is the writing and formatting guide for Azimuth docs. If you're adding or editing a page, match what's here.

## Tone

Keep it natural and direct write like you're explaining something to a fellow mod developer, not writing a formal API reference. Short sentences are fine. Contractions are fine.

The goal is that reading a page feels the same as reading a clear comment in source code, not a JavaDoc wall.

## File and folder naming

Files and folders use **title case with spaces** no underscores, no hyphens:

```
docs/
  Getting Started.md
  Super Behaviours/
    Super Behaviours.md
    Extension Reference.md
    Kinetic Extension.md
    Rendered Extension.md
    Item Requirement Extension.md
  Advancements/
    Advancements.md
  Outlines/
    Outlines.md
```

The sidebar is auto-generated from the filesystem, so the folder name becomes the section heading and the filename becomes the item label both should read cleanly as plain English.

## Page structure

Each page follows the same loose structure:

1. **`#` H1 title** matches the filename exactly.
2. **One-paragraph intro** what this thing is and what problem it solves. No nested concepts yet.
3. **`##` H2 sections** major concepts or tasks, roughly in the order someone would encounter them.
4. **`###` H3 subsections** method-level or detail-level breakdowns within a section.

For reference pages (extensions, etc.) it's fine to open directly with implementing the interface, then cover individual methods.

## Code examples

Always include one. If the real API has a natural usage pattern, show that. If the exact usage is context-dependent, genericify it use names like `YourMod.REGISTRATE`, `MyItems.MY_ITEM`, `MyCustomBehaviour`, etc.

Comment individual constructor/builder arguments inline rather than separately describing them:

```java
new ExpandingLineOutlineInstruction(
    PonderPalette.WHITE,         // color palette
    new Vec3(0.5, 1.0, 0.5),    // start point
    new Vec3(2.5, 1.0, 0.5),    // end point
    40,                          // total duration in ticks
    10                           // growing ticks how long the expand animation takes
);
```

For builder-style APIs, show a complete definition including a realistic parent and trigger:

```java
PROVIDER.create("my_advancement", b -> b
    .icon(MyItems.MY_ITEM)
    .title("My Title")
    .description("My description.")
    .after(() -> AllAdvancements.ROOT) // display inside the Create tab omit to create a new tab
    .awardedForFree()
);
```


## Tables

Use tables for:
- Method/field reference overviews (description pairs)
- Enum value breakdowns (like `TaskType`)
- Extension overview lists with links

Don't use tables for things that need explanation those should be `###` sections with prose and code.


## Notes and callouts

For things that are easy to mess up or have non-obvious caveats, use a blockquote note:

```markdown
> If you add a `RenderedBehaviourExtension` after the block entity has already been rendered, call `invalidateRenderBoundingBox()` to force a client refresh.
```

Keep them short. One sentence or two.


## Internal links

Link targets use relative paths and include the `.md` extension:

```markdown
[Super Block Entity Behaviours](./Super Behaviours/Super Behaviours.md)
[Kinetic Extension](./Kinetic Extension.md)
[back to overview](./Super Behaviours.md#extensions)
```

For anchor fragments, use lowercase with hyphens (VitePress converts `## Extensions` `#extensions`).


## What to avoid

- **Horizontal rules (`---`)** don't use them. Section headings already provide visual separation; `---` just adds noise.
- **Restating the section heading** in the first sentence if the section is `### getRenderer()`, don't start the paragraph with "The getRenderer method..."
- **Over-explaining internal plumbing** document what a developer needs to *use* the API, not every detail of how it's implemented
- **Separate methods-only pages** if a feature has 2-3 methods, keep them on one page. Only split when content is long enough to make scrolling painful.
