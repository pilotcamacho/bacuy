# Bacuy — Implementation Action Plan

## Strategy

The app is built in **10 sequential phases**. Each phase has clear deliverables so it can be reviewed and tested before the next begins. The first four phases constitute the **MVP**: a working, shippable app with capture, AI classification, and all record types. Later phases add the advanced features (voice, geofencing, smart alarms, message queue engine) that make Bacuy distinctive.

---

## Phase 0 — Foundation & Infrastructure
**Goal:** Everything needed before writing a single feature.

### Tasks
- [ ] Scaffold Expo + React Native project (TypeScript, managed workflow)
- [ ] Configure Expo Router with tab and stack layout skeleton
- [ ] Set up NativeWind (Tailwind for React Native)
- [ ] Initialize Zustand stores (auth, records, ui, messageQueue)
- [ ] Set up `i18next` + `react-i18next` with `en` and `es` locale files (empty keys, correct structure)
- [ ] Create AWS account and install Amplify CLI
- [ ] Run `amplify init` — configure project, region, and environments (dev / prod)
- [ ] Set up CI/CD pipeline (GitHub Actions): lint, type-check, test on every PR
- [ ] Configure EAS Build for iOS and Android

### Deliverables
- Runnable blank app on iOS simulator and Android emulator
- AWS Amplify project linked and deploying
- i18n wired up end-to-end (language switcher toggles between English and Spanish)

---

## Phase 1 — Authentication
**Goal:** Secure, working login before any data is stored.

### Tasks
- [ ] Define Amplify Auth (Cognito user pool): email/password, Google OAuth, Apple Sign-In
- [ ] Build Sign Up screen (email, password, confirmation code)
- [ ] Build Sign In screen
- [ ] Build Password Reset flow
- [ ] Implement Google OAuth (Cognito hosted UI or custom)
- [ ] Implement Apple Sign-In (required for iOS App Store when any social login is present)
- [ ] Session persistence via Amplify Auth + Zustand auth store
- [ ] Protect all app routes — redirect unauthenticated users to Sign In

### Deliverables
- Users can register, log in, log out, and reset their password
- Sessions persist across app restarts
- All auth strings localized in English and Spanish

---

## Phase 2 — Core Data Layer
**Goal:** Offline-first data sync ready before building any UI on top of it.

### Tasks
- [ ] Define final GraphQL schema in `amplify/backend/api/schema.graphql`:
  - `User`, `Record` (with self-referencing `subItems` for project hierarchy), `Alarm`, `HabitEntry`, `MessageQueueEntry`
  - All models use `@auth(rules: [{ allow: owner }])` — no cross-user data access
- [ ] Push schema and generate DataStore models (`amplify push`)
- [ ] Wire Amplify DataStore for offline-first sync with conflict resolution strategy (`AUTO_MERGE`)
- [ ] Build generic CRUD helpers (create, read, update, soft-delete) over DataStore
- [ ] Add `MessageQueueEntry` model: fields for `trigger`, `goal`, `priority`, `channel`, `content`, `deliveredAt`, `status`
- [ ] Write unit tests for all CRUD helpers

### Deliverables
- Data persists locally and syncs to DynamoDB when online
- All models match the spec schema
- Tests pass for create/read/update/delete on all models

---

## Phase 3 — Free-Form Capture + AI Classification
**Goal:** The core Bacuy loop — write anything, AI organizes it.

### Tasks
- [ ] Build the **Capture Screen**: full-screen blank input, minimal chrome, submit button and voice button placeholder
- [ ] Integrate AI classification API (Amazon Bedrock — Claude model, or OpenAI as fallback):
  - Send `rawInput` + user's preferred language
  - Return: `{ category, title, description, lifeArea, priority, dueDate, tags }`
- [ ] Engineer classification prompt — must be localizable (prompt itself in English; user input in any language)
- [ ] Build **Suggestion Card** UI: shows AI result, user can confirm or edit each field before saving
- [ ] On confirm: save `Record` via DataStore, navigate to the record's detail screen
- [ ] Handle loading state (skeleton UI during AI call) and error state (retry or manual classify)
- [ ] Handle offline capture: queue raw input locally, classify when connectivity returns

### Deliverables
- End-to-end flow: user types → AI classifies → user confirms → record saved
- Works offline (capture queued, classified on reconnect)
- All text localizable

---

## Phase 4 — Record Type UIs
**Goal:** Each record category has its own creation, detail, and management screens.

### 4.1 Standard Task
- [ ] Task list screen (grouped by life area, sorted by priority/due date)
- [ ] Task detail screen: title, description, due date, status toggle (pending → done)

### 4.2 Habit
- [ ] Habit list screen with streak indicators
- [ ] Habit detail screen: description, streak count, history log
- [ ] **Check-In form**: mood selector, location (auto or manual), companions (multi-select text), prior activities, notes
- [ ] Streak calculation and visual progress bar
- [ ] Habit template support (e.g., import "50 Wedding Promises" list)

### 4.3 Skill
- [ ] Skill list screen with overall progress percentage
- [ ] Skill detail screen: goal description, milestone list, session log
- [ ] **Add Milestone** form: name, target date, completion toggle
- [ ] **Log Session** form: duration, notes, outcome rating
- [ ] Year-end goal framing: link skill to a year and show annual progress

### 4.4 Attitude
- [ ] Attitude list screen
- [ ] Attitude detail screen: value/framework link (e.g., Toltec agreements), reflection prompt
- [ ] **Log Application** form: situation description, date/time, outcome, tags
- [ ] Reflection prompt engine: surfaces attitude records periodically as message queue entries

### 4.5 Project
- [ ] Project list screen
- [ ] Project detail screen: hierarchical tree of sub-activities and tasks (recursive)
- [ ] Add sub-activity / add task at any level of the tree
- [ ] Each leaf task: due date, time estimate, assignee (self), result criteria, status
- [ ] Status board view: columns for Pending / In Progress / Blocked / Done
- [ ] Timeline view: tasks ordered by due date with overdue highlighting

### Deliverables
- All five record types fully navigable, creatable, and editable
- Records created via Phase 3 capture flow open in the correct detail screen

---

## Phase 5 — Message Queue Engine
**Goal:** Centralize all user-facing communication through one delivery system.

This is the architectural backbone of the app. Every notification, nudge, and reminder is a `MessageQueueEntry` — nothing bypasses this layer.

### Tasks
- [ ] **Trigger evaluator** (AWS Lambda): runs on a schedule (every 5 min) and on event hooks
  - Evaluates all active alarms and rule conditions
  - Creates `MessageQueueEntry` records for conditions that are met
- [ ] **Priority & de-duplication logic** (Lambda): before inserting a new entry, check if a similar one is already pending; if so, merge or discard
  - Priority factors: alarm type, urgency, time sensitivity, user's current context
- [ ] **Delivery dispatcher** (Lambda + SNS):
  - `PUSH`: Expo Notifications + Amazon SNS → device push notification
  - `IN_APP`: flag entry as pending; app polls/subscribes and shows banner on next open
  - `VOICE`: flag entry for TTS playback when voice mode is active
- [ ] **In-app notification banner**: subscribes to AppSync real-time for new `MessageQueueEntry` records
- [ ] **Message history screen**: list of past messages, status (delivered/read/dismissed)
- [ ] Localize all message content (templates in `en` and `es` locale files)

### Deliverables
- No notification or reminder is sent outside this queue
- Lambda evaluates conditions and dispatches correctly
- In-app banner appears in real time for new messages
- Message history is accessible and readable

---

## Phase 6 — Alarms & Geofencing
**Goal:** All three alarm types working and creating message queue entries.

### 6.1 Time-Based Alarms
- [ ] Alarm creation UI: date/time picker, recurrence (once, daily, weekly, custom)
- [ ] Expo Notifications schedules local notification (for immediate/short-term alarms)
- [ ] Amazon EventBridge rule created via Lambda for long-term/recurring alarms
- [ ] On fire: Lambda creates `MessageQueueEntry` → delivered via Phase 5 dispatcher

### 6.2 Location-Based Alarms (Geofence)
- [ ] Request location permissions (foreground + background)
- [ ] Geofence setup UI: search address or pick on map, set radius, choose trigger (arrive / depart)
- [ ] Create geofence in Amazon Location Service via Lambda
- [ ] Location Service event → EventBridge → Lambda → `MessageQueueEntry`
- [ ] Battery optimization: use significant location change mode, not continuous GPS

### 6.3 Smart / Relative Alarms
- [ ] Smart alarm UI: guided form for common patterns:
  - "N days/hours before [date]"
  - "The business day before the [Nth] of each month"
  - "Every [weekday] at [time]"
- [ ] Store rule as structured string (e.g., `BUSINESS_DAY_BEFORE:15:MONTHLY`)
- [ ] Lambda parser evaluates rule daily and schedules concrete EventBridge events
- [ ] Alarm management screen: list all alarms per record, toggle active/inactive, delete

### Deliverables
- All three alarm types create message queue entries that reach the user
- Geofencing works on background in both iOS and Android
- Smart alarm rules are stored and evaluated correctly

---

## Phase 7 — Voice Input
**Goal:** Hands-free capture and task playback.

### Tasks
- [ ] Integrate `react-native-voice` for speech-to-text transcription
- [ ] Request microphone permission with explanation
- [ ] Voice capture button on Capture Screen: tap-to-record, waveform feedback, auto-submit on silence
- [ ] Transcribed text feeds into the same AI classification flow as typed input (Phase 3)
- [ ] **Wake word detection**: integrate a wake word library (e.g., `react-native-porcupine` with a custom "Hey Bacuy" wake word) for background activation — note: iOS background audio entitlement required
- [ ] **Audio playback of tasks**: on voice command "read my tasks", use Expo Speech (TTS) to read pending high-priority message queue entries aloud
- [ ] Voice privacy: audio is processed ephemerally; raw audio is never stored

### Deliverables
- User can capture a record entirely by voice
- Wake word activates capture without touching the phone
- TTS reads pending tasks on request

---

## Phase 8 — Intelligent Grouping & Priority
**Goal:** The app surfaces the right things at the right time autonomously.

### Tasks
- [ ] **Life area tagging**: AI classification (Phase 3) already assigns `lifeArea`; build a settings screen where user can customize their life areas list
- [ ] **Priority scoring algorithm** (client-side, Zustand selector):
  - Score = `(deadline_urgency × 0.4) + (importance × 0.35) + (energy_match × 0.25)`
  - Recalculated on every sync
- [ ] **Home / Dashboard screen**:
  - Today's top 5 priorities across all record types
  - Habit check-ins due today
  - Upcoming deadlines (next 7 days)
  - Pending message queue entries
- [ ] **Grouped list view**: records grouped by life area with collapsible sections
- [ ] **Smart scheduling suggestion**: when user marks a task "schedule this", suggest time blocks based on due date and estimated duration
- [ ] Drag-and-drop manual priority override on task lists

### Deliverables
- Dashboard gives a clear daily view
- Priority scoring is visible and adjustable
- Life areas are customizable per user

---

## Phase 9 — Localization & Accessibility Polish
**Goal:** The app is fully usable in Spanish and English with no hardcoded strings.

### Tasks
- [ ] Audit all screens for hardcoded strings — move every user-visible string to locale files
- [ ] Translate all keys to Spanish (`es.json`) — review with native speaker
- [ ] Localize all push notification content (templates in both languages, selected by `preferredLanguage` at send time)
- [ ] Localize all AI classification prompts (prompt instructs model to respond in user's language)
- [ ] Localize all TTS (voice playback) strings
- [ ] Date and time format: use locale-aware formatting (`Intl.DateTimeFormat` or `date-fns` with locale)
- [ ] Accessibility: ensure all interactive elements have `accessibilityLabel`, VoiceOver/TalkBack compatible
- [ ] Performance audit: measure list screen render times on a mid-range Android device; target < 200ms
- [ ] Fix any performance bottlenecks (virtualized lists, memoization, lazy loading)

### Deliverables
- Zero hardcoded strings
- Full Spanish translation reviewed
- All lists render under 200ms on mid-range device

---

## Phase 10 — Testing, Security & Launch
**Goal:** Ship a stable, secure, store-ready app.

### Tasks

#### Testing
- [ ] Unit tests (Jest): all Zustand stores, CRUD helpers, priority scoring, smart alarm rule parser
- [ ] Integration tests: DataStore sync, auth flows, message queue dispatch
- [ ] E2E tests (Maestro or Detox): Capture → classify → confirm → record appears; Habit check-in flow; Project breakdown flow
- [ ] Manual QA on physical iOS and Android devices

#### Security
- [ ] Verify all DynamoDB records are owner-scoped (attempt cross-user access in tests — must fail)
- [ ] Confirm voice audio is not persisted anywhere
- [ ] Review Lambda functions for injection vulnerabilities
- [ ] Enable AWS WAF on AppSync endpoint
- [ ] Rotate and store all API keys in AWS Secrets Manager (never in the app bundle)

#### Launch
- [ ] Privacy policy and Terms of Service pages (in-app + web)
- [ ] App Store Connect setup: app metadata, screenshots (English + Spanish), age rating
- [ ] Google Play Console setup: same metadata
- [ ] TestFlight beta (iOS) + Play internal testing track (Android)
- [ ] Beta period: collect feedback, fix critical bugs
- [ ] Production release: phased rollout (10% → 50% → 100%)

### Deliverables
- All test suites passing
- Security audit clean
- App live on App Store and Google Play

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| iOS background restrictions limit wake word detection | High | Use Expo background task API; test early; have tap-to-activate as fallback |
| AI classification latency (2-5s) disrupts UX | Medium | Show skeleton UI immediately; classify async; allow manual classification offline |
| Smart alarm rule parsing complexity | Medium | Ship Phase 6.3 with a guided form (no free-text NLP) in v1; add NLP in v2 |
| Amplify DataStore conflict resolution on recursive project trees | Medium | Use `AUTO_MERGE`; add server-side validation Lambda for consistency |
| Geofencing battery drain on Android | Medium | Use significant-location-change mode; document battery impact to users |
| Apple Sign-In requirement | Low | Required for App Store if Google login is present — implement in Phase 1 |

---

## MVP Scope (Phases 0–4 + Basic Phase 5)

For the fastest path to a working product, the MVP includes:

- Foundation, Auth, Core Data, Capture + AI, all Record Type UIs
- Time-based alarms only (no geofence, no smart rules)
- Basic push notifications via Expo Notifications (no SNS backend)
- No wake word (tap-to-record voice only)
- English only

**Estimated MVP duration: ~14 weeks** for a solo developer; ~8 weeks with a two-person team.

Full feature set (all 10 phases): ~28 weeks solo / ~16 weeks with a two-person team.
