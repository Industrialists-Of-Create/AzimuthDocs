# Extension Reference

Extensions are marker interfaces that opt a `SuperBlockEntityBehaviour` into additional systems. They're picked up lazily and cached per block entity, so behaviours that don't implement a given extension have zero impact on that system's cost.

For more about `SuperBlockEntityBehaviour`s, see [Super Block Entity Behaviours](./Super Behaviours.md).

| Extension | Description |
| --- | --- |
| [`KineticBehaviourExtension`](./Extensions/Kinetic%20Extension.md) | Adds propagation positions and rotation transfer overrides for kinetic networks. |
| [`RenderedBehaviourExtension`](./Extensions/Rendered%20Extension.md) | Adds behaviour-level BER rendering, optional Flywheel visuals, and optional render bounds expansion. |
| [`ItemRequirementBehaviourExtension`](./Extensions/Item%20Requirement%20Extension.md) | Adds per-behaviour item requirements to schematic requirement flows. |
