# Dev Personality Quiz – Implementation Kickoff

This document captures the initial plan to begin building the quiz experience that spans Linear issues OAT-8, OAT-9, and OAT-12 for the `datewithdev` project.

## Shared Objectives
- Deliver an interactive quiz that feels like a terminal/dev environment.
- Collect high-quality signals about a user’s coding habits and compute a personality type.
- Allow returning users to re-run the quiz while preserving history and protecting data quality.

## Architecture Snapshot
- **Platform:** React (Next.js or Vite) SPA backed by a lightweight API (Next API routes or FastAPI) for persistence. Final choice pending stack confirmation.
- **UI System:** Tailwind or CSS vars themed to mimic terminal aesthetics (monospace typography, phosphor palette, animated cursor). Build as composable components so theme can wrap future flows.
- **State/Data:** Quiz state managed via React Context + reducer for predictable transitions, cached in `localStorage` for offline resilience (OAT-8 acceptance criterion). Server persistence via `/api/quiz-submissions`.
- **Scoring:** Client collects answers; scoring service computes `PersonalityType` using weightings from data/ML partners. Store both raw answers and derived type.
- **Retake Mechanics:** Each submission persists with timestamp + version. Retake flow duplicates question set but references previous result to show diff and enforce cooldown rules.

## Issue-Level Breakdown

### OAT-9 — Terminal-Inspired Quiz UI
1. Create design tokens (color ramps, typography scale, spacing) with accessibility checks (contrast ≥ 4.5:1, focus outlines).
2. Build core components:
   - `TerminalFrame` (chrome, glow, background animation toggle).
   - `CommandPrompt` (intro text, caret animation).
   - `QuizInput` variants: multiple choice list, toggle group, slider, text input.
   - `ProgressPulse` indicator with reduced-motion fallback.
3. Theme integration: global CSS vars + `prefers-color-scheme` detection; allow manual override.
4. Prototype in Storybook to validate states and document usage.
5. Run usability micro-tests (5 participants) to verify authenticity vs. comprehension; capture action items.

### OAT-8 — Collect Coding Habit Answers
1. Finalize MVP questionnaire (collaboration, tools, speed vs. polish, learning) with localization-ready copy JSON.
2. Implement quiz flow:
   - Keyboard-first navigation (`tabindex`, hotkeys, `aria-live` for transitions).
   - Progress tracker (percent + question count).
3. Persistence layer:
   - Debounced `localStorage` sync.
   - POST `/api/quiz-responses` storing `userId`, `answers[]`, `metadata`.
4. Integrate scoring hook to compute provisional personality type on submit (calls `/api/personality/score`).
5. Analytics events (`quiz_start`, `quiz_answer`, `quiz_submit`) with type + timestamps.

### OAT-12 — Retake Flow for Returning Users
1. Surface entry points:
   - `Profile` page CTA.
   - `Settings > Personality` section with last-updated timestamp.
   - Post-milestone notification banner linking to retake.
2. Retake UX:
   - Confirm dialog explaining impact on matches.
   - History drawer comparing previous vs. new type.
3. Cooldown logic (configurable, default 30 days) enforced server-side with descriptive error if violated.
4. Background job to notify users when retake recommended (web push or email template).
5. Data handling:
   - Store submission history table (`quiz_attempts`) referencing user and result.
   - Flag downstream match service to refresh compatibility scores after retake.

## Technical Spike Checklist (Next 1-2 Days)
- [ ] Confirm target stack (React/Next + Node API vs. alternative).
- [ ] Define API schema (OpenAPI draft) for quiz submissions and scoring.
- [ ] Build design token starter file + Tailwind config prototype.
- [ ] Draft question copy doc and review with localization.
- [ ] Outline data model (Prisma schema) for `quiz_attempts` + `personality_types`.

## Dependencies & Risks
- **Iconography + Sound Design:** Requires brand alignment before finalizing UI polish (OAT-9 note).
- **Scoring Logic:** Needs data/ML input; implement contract-first interface to unblock UI work.
- **History & Notifications:** Retake flow depends on notification service availability; may require feature flag.

## Next Steps
1. Set up repo scaffold (`apps/web`, `apps/api`) with shared types package.
2. Implement design tokens + terminal shell layout.
3. Build quiz question data model and form wizard.
4. Wire persistence and retake entry points iteratively, landing feature flags per issue.

