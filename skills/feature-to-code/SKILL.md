# Skill: Feature Description to Working Code

## When to Use
When given a written feature description, user goal, or behavior spec — produce working React code immediately.

## When NOT to Use
- When a written spec or acceptance criteria is explicitly requested instead
- When the feature requires significant architectural decisions not yet made (flag first)

## Inputs
- Written description of the feature
- User goal or intended behavior
- Figma reference (if available)
- Any relevant existing components or context

## Ideal Output
- Working React implementation of the described feature
- Uses existing components from the atomic library where possible
- Integrates with design.md tokens and shadcn base
- Includes a brief note on: what was built, any assumptions made, any bugs noticed and fixed

## Process
1. Identify the user goal behind the feature request
2. Map to existing components where possible — build new ones only when needed
3. If complexity is high, flag it with the tradeoff format before proceeding
4. Write working code
5. Note any assumptions made and any bugs fixed during generation

## Tradeoff Flag Format
> ⚠️ **Tradeoff:** [what the tension is]
> **Recommended:** [Claude's suggestion]
> **Why:** [one-line reason]
> **Proceeding with:** [what will be implemented unless told otherwise]

## Common Failure Modes
- **Over-engineering:** Default to the simplest implementation that meets the goal
- **Ignoring bugs:** If a bug is spotted during generation, fix it and note it — never skip
- **Missing context:** Ask one specific question if a critical detail is missing before writing code
- **New dependencies:** Never introduce a new library without flagging it first

## Success Criteria
1. Feature works as described on first test
2. Implementation uses existing design system and component library
3. No known bugs left unaddressed
