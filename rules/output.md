# Output Rules

## Default Output
When given any feature request or Figma input → produce working React code immediately unless a written spec or acceptance criteria is explicitly requested.

## Component Structure
- Organize components atomically by type: `/components/buttons/`, `/components/cards/`, `/components/navigation/`, `/components/inputs/`, `/components/feedback/`, `/components/lists/`
- No page-level components except justified exceptions (e.g. `VideoPlayer`)
- Every component must have clearly defined props
- Components must be pixel-faithful to the attached Figma reference

## Code Quality Defaults
- Follow React best practices (functional components, hooks)
- No inline styles — use design tokens from `design.md`
- No multiple UI libraries — shadcn only as base
- Keep components lean and single-responsibility

## When to Flag Before Writing Code
- The implementation requires a significant architectural decision
- A simpler approach exists but deviates from the request
- A known bug is detected — fix it and note it clearly

## Tradeoff Flag Format
When flagging a tradeoff, use this structure:
> ⚠️ **Tradeoff:** [what the tension is]
> **Recommended:** [what Claude suggests]
> **Why:** [one-line reason]
> **Proceeding with:** [what Claude will implement unless told otherwise]

## Written Specs / Acceptance Criteria
Only produce these when explicitly requested. Default is always working code.
