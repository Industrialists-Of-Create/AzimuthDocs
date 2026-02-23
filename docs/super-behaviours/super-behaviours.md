# Super Block Entity Behaviours

## What are they?

Super Block Entity Behaviours are extended versions of block entity behaviours, but with the intention of full block entity level control. This means that they can add feature complete systems to blocks, without extensive mixins or direct control. The primary example of this is the Cogwheel Chain Drives from Bits 'n' Bobs, which are able to apply the behaviour to any coghwel block, regardless of the mod that added it.

## How do they work?

Super Block Entity Behaviours are simply an extension of traditional block entity behaviours, but with the addition of a few extra methods. These methods are mostly to help with accessing typical block entity data, such as the block state, position, and level.

The main power of the Super Block Entity Behaviours is the ability to use Extensions. Extensions are interfaces that mark additional capabilities that the behaviour requires. For example, the Cogwheel Chain Drive behaviour, among others, requires the `KineticBehaviourExtension`, where when applied to a `KineticBlockEntity`, it can provide additional propagation and connection logic, without needing to directly modify the `KineticBlockEntity` class.

The most powerful extension is the `RenderedBehaviourExtension`, which allows the behaviour to extend the blocks rendering, to allow for custom models to be overlaid on top of the blocks normal model. This is also used by the Cogwheel Chain Drive behaviour, to render the chain on top of the normal cog model.