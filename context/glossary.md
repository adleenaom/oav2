# Glossary

## Content Hierarchy

**For You**
A single short video (reel format) uploaded by the OpenAcademy team. Always free. Features a creator speaking, often related to a topic covered in a Bundle or Lesson Plan.

**Bundle**
A series of Chapters. Purchased as a unit using OA Credits (or free). Chapters are immediately unlocked upon purchase. A bundle has `lessonId` which determines its relationship:
- `lessonId: number` — part of a Lesson Plan. Shown inside the Lesson Detail page under "Lesson Bundles". Not shown in the Originals grid.
- `lessonId: null` — standalone bundle. Shown in the "OpenAcademy Originals" section on the homepage. Sold independently.

Both types open the same Bundle Detail page.

**Chapter**
A unit within a Bundle. Contains one or more Parts. In the current direction, most Chapters have a single Part (a video).

**Part**
The atomic unit of content within a Chapter. Can be a video, survey, or image.

**Lesson Plan**
A curated collection of Bundles forming a complete course. Completing all Bundles in a Lesson Plan entitles the user to a certificate. Content must be consumed in order. Can be priced in OA Credits or free. Users may purchase individual Bundles within a Lesson Plan without buying the whole plan.

**Creator**
A person featured in For You videos, Bundles, or Lesson Plans. Associated with content across all formats.

## Commerce & Credits

**OA Credits**
OpenAcademy's virtual in-app currency. Topped up with real money (currently iOS/Android in-app purchase; Stripe planned for PWA future). Also earnable via voucher or campaign codes.

**Campaign Code / Voucher**
A redeemable code that either grants OA Credits to the user's account or directly unlocks a specific Bundle or Lesson Plan.

**My Learnings**
The section of the app where users see Bundles they have purchased or unlocked.

## Navigation & Progress

**Continue Watching**
A progress-tracking feature that shows the user where they left off across any active Bundle or Lesson Plan.

**Discover**
The search and browse section of the app for finding For You videos, Bundles, and Lesson Plans.

**Magazines**
A section linking to external articles relevant to OpenAcademy content topics.

**Content Preference / Tags**
User-defined topic interests used to personalize content recommendations.
