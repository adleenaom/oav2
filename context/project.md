# Project Context

## What We're Building
OpenAcademy PWA is a progressive web app built from scratch in React, replicating the OpenAcademy native iOS and Android app. The first milestone is feature parity. The second is fast iteration with beta users.

## Why PWA
- Faster shipping and iteration cycle than native
- Accessible to beta users via browser without app store friction
- Enables direct feedback loops and rapid usability testing

## Current Status
- Native app exists on iOS and Android (source code accessible, not being ported)
- PWA is being built fresh
- Design system is being built alongside the PWA, documented in `design.md`
- Backend and API layer TBD

## Business Model
- Freemium: For You videos are always free
- Bundles and Lesson Plans can be free or priced in OA Credits
- Users can purchase individual bundles within a Lesson Plan
- OA Credits are topped up with real money (simulated in PWA for now)
- Credits can also be granted via voucher/campaign codes
- Campaign codes can grant credits OR directly unlock content

## Core Features (must exist at launch)
- Video player supporting 3 content formats (For You, Bundle, Lesson Plan)
- User authentication
- Discover (search + search results)
- Lesson Plan navigation (ordered, certificate on completion)
- Continue Watching / progress tracking
- My Learnings (purchased bundles)
- Magazines (links to articles)
- Credit purchase history and tracking
- Account features: content preferences (by tags), account details, settings

## Development Workflow
- Solo: designer-product owner using Claude as dev partner
- Input: Figma screenshots, written feature descriptions, qualitative feedback
- Testing: deployed to beta site, qualitative feedback collected and uploaded to Claude
- Analytics: Looker Studio tracking retention and usability (Claude helps summarize insights)
- Future: handoff to development team

## What Parts Change Often
- Design tokens and component specs (as design.md evolves)
- Feature scope and priority (based on beta feedback)
- Backend and API definitions (TBD)

## What Is Stable
- Content hierarchy (For You → Bundle → Lesson Plan)
- Credit system logic
- Core feature set listed above
- Component organization pattern (atomic, by type)
