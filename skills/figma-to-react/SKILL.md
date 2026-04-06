# Skill: Figma to React Component

## When to Use
Use this skill when given a Figma screenshot or design reference and asked to produce a React component.

## When NOT to Use
- When building a full page or screen (break into atomic components first)
- When no visual reference is provided (request Figma first)

## Inputs
- Figma screenshot or exported image
- Component name and intended use
- Any relevant props or states (if specified)

## Ideal Output
- A single React functional component
- Props clearly defined with sensible defaults
- Styled using shadcn base + design.md tokens only (no inline styles, no additional libraries)
- Pixel-faithful to the Figma reference
- Placed in the correct atomic folder: `/components/[type]/[ComponentName].jsx`
- No page-level abstraction unless explicitly justified (VideoPlayer is an exception)

## Process
1. Identify the component type (button, card, input, navigation, feedback, list, etc.)
2. Map Figma visual properties to design.md tokens
3. Define props and default values
4. Build the component using shadcn primitives customized to design tokens
5. Flag any Figma ambiguity before writing (one question max)
6. Output the component with a brief note on folder placement

## Common Failure Modes
- **Mismatch with Figma:** Always reference the attached image; do not approximate
- **Hardcoded styles:** Always use design tokens, never hardcode hex or px values
- **Monolithic output:** Never combine multiple distinct components into one file
- **Missing props:** Always define props even if only one state is shown in Figma

## Success Criteria
1. Component visually matches Figma at first render
2. All design values trace back to design.md tokens
3. Props are defined and the component is reusable across contexts
