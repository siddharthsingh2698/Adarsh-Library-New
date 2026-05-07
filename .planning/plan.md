# Adarsh Library — Production Development Plan

## Overview
Complete rebuild of the Adarsh Library Management System (ALMS) to match the full specification in `project.md`. The current codebase has a partial React + Express + MySQL foundation. We are migrating to the full stack defined in `context.md`: React + Tailwind CSS frontend, Node.js + Express + PostgreSQL backend, with Socket.io, PDF generation, scheduled jobs, and automated notifications.

---

## Tech Stack (Final)

| Layer | Choice |
|---|---|
| Frontend | React (CRA, existing) + Tailwind CSS |
| Styling | Tailwind CSS (replace current CSS files) |
| Backend | Node.js + Express (existing, extend) |
| Database | PostgreSQL (migrate from MySQL) |
| Auth | JWT + bcrypt (existing, keep) |
| Realtime | Socket.io |
| Notifications | node-cron + Nodemailer + Twilio (optional SMS) |
| PDF | puppeteer or pdfkit |
| QR Code | qrcode npm package |
| Hosting | Railway/Render (API) + Vercel (frontend) |

---

## Current State Assessment

**Exists (keep/refactor):**
- Express server with auth, student CRUD, seat routes, shift routes, plan routes, subscription routes
- React frontend with Login, Dashboard, Students, AddStudent, EditStudent, Subscriptions pages
- JWT auth middleware
- MySQL database config

**Missing (build from scratch):**
- PostgreSQL migration (replace MySQL)
- Tailwind CSS (replace all .css files)
- Visual seat map (interactive grid)
- Check-in / check-out system
- Locker management
- Fee ledger with PDF receipts
- Notification & alarm system (cron jobs, email, SMS)
- Reports & analytics
- Socket.io realtime
- QR code generation
- Student ID card printing

---

## Phase Breakdown

---

### PHASE 1 — Foundation Rebuild (Database + Auth + Layout)
**Goal:** Solid base. PostgreSQL schema, Tailwind layout matching UI mockups, working auth.

#### Backend
- [ ] 1.1 Replace `mysql2` with `pg` (node-postgres)
- [ ] 1.2 Write full PostgreSQL schema (`/server/db/schema.sql`) per `context.md` — all 9 tables
- [ ] 1.3 Write seed script for admin user + sample slots
- [ ] 1.4 Update `config/database.js` to use `pg` pool
- [ ] 1.5 Update all existing routes to use pg queries (auth, students, seats, shifts, plans, subscriptions)
- [ ] 1.6 Add `asyncHandler` wrapper + global error middleware
- [ ] 1.7 Add Joi validation on all POST/PUT routes
- [ ] 1.8 Standardize all responses: `{ success, data, message }`
- [ ] 1.9 Add soft-delete (`deleted_at`) to students table

#### Frontend
- [ ] 1.10 Install Tailwind CSS + configure `tailwind.config.js` with the design tokens from UI mockups (colors, fonts, border-radius)
- [ ] 1.11 Install Google Fonts: Newsreader + Inter
- [ ] 1.12 Install Material Symbols Outlined icon font
- [ ] 1.13 Rebuild `Layout.js` — sidebar nav matching mockup (Dashboard, Seat Map, Student Directory, Fee Ledger, Configuration, Support, Logout)
- [ ] 1.14 Rebuild `Login.js` with Tailwind styling
- [ ] 1.15 Update `AuthContext.js` — ensure token storage + refresh logic is solid

**Deliverable:** App boots, admin can log in, sidebar renders correctly.

---

### PHASE 2 — Dashboard + Student Directory
**Goal:** Dashboard overview cards + full student CRUD matching UI mockups.

#### Backend
- [ ] 2.1 `GET /api/v1/dashboard` — return: today's occupancy, pending dues count, active students count, recent check-ins
- [ ] 2.2 `GET /api/v1/students` — paginated, filterable by slot/status/fee_status, searchable
- [ ] 2.3 `POST /api/v1/students` — create with photo upload (multer), QR code auto-generated
- [ ] 2.4 `GET /api/v1/students/:id` — full profile with seat, locker, fee history
- [ ] 2.5 `PUT /api/v1/students/:id` — update
- [ ] 2.6 `DELETE /api/v1/students/:id` — soft delete (set deleted_at)
- [ ] 2.7 QR code generation on student create (`qrcode` package → store as base64 or file)

#### Frontend
- [ ] 2.8 Rebuild `Dashboard.js` — bento grid layout: occupancy ring, pending dues, active students, recent check-ins table, quick actions panel (matches `Dashboard.html` mockup)
- [ ] 2.9 Rebuild `Students.js` → rename to `StudentDirectory.js` — table with avatar, ID, slot badge, seat, fee status badge, pagination (matches `StudentDirectory.html` mockup)
- [ ] 2.10 Rebuild `AddStudent.js` — form with photo upload, all fields from schema
- [ ] 2.11 Rebuild `EditStudent.js` — pre-filled form + deactivate button
- [ ] 2.12 Add student profile drawer/modal — seat, locker, fee history tabs
- [ ] 2.13 Student ID card print view with QR code

**Deliverable:** Full student management working end-to-end.

---

### PHASE 3 — Seat Map + Slot Management
**Goal:** Interactive visual seat grid, slot CRUD, seat assignment flow.

#### Backend
- [ ] 3.1 `GET/POST/PUT/DELETE /api/v1/slots` — time slot CRUD
- [ ] 3.2 `GET /api/v1/seats` — all seats with current status per slot
- [ ] 3.3 `POST /api/v1/seats/bulk` — bulk create seats (rows × cols)
- [ ] 3.4 `PUT /api/v1/seats/:id` — update status (maintenance, etc.)
- [ ] 3.5 `POST /api/v1/seat-allotments` — assign seat to student + slot
- [ ] 3.6 `PUT /api/v1/seat-allotments/:id` — swap / update allotment
- [ ] 3.7 `DELETE /api/v1/seat-allotments/:id` — release seat
- [ ] 3.8 `GET /api/v1/seats/map?slot_id=` — seat grid with status per slot

#### Frontend
- [ ] 3.9 Build `SeatMap.js` page — interactive grid matching `LibrarySeatManagement.html` mockup
  - Color-coded seats: green=available, red=occupied, orange=reserved, grey=maintenance
  - Click seat → tooltip/modal with student info or assign button
  - Slot selector tabs (Morning / Afternoon / Evening)
  - Occupancy % badge
  - Right sidebar: Quick Insights (free, overdue, maintenance counts) + selected seat detail card
- [ ] 3.10 Build `SeatAssignModal.js` — search student, pick slot, confirm
- [ ] 3.11 Build `SlotManagement.js` (part of Configuration page) — CRUD for time slots with capacity

**Deliverable:** Admin can view seat map, assign/release seats, manage slots.

---

### PHASE 4 — Check-In / Check-Out System
**Goal:** Manual check-in, QR scan, live occupancy, attendance log.

#### Backend
- [ ] 4.1 `POST /api/v1/checkins` — create check-in (manual/qr/self), flag if outside slot
- [ ] 4.2 `PUT /api/v1/checkins/:id/checkout` — record check-out time
- [ ] 4.3 `GET /api/v1/checkins/live` — currently checked-in students
- [ ] 4.4 `GET /api/v1/checkins/attendance` — date-range attendance log, filterable
- [ ] 4.5 `GET /api/v1/checkins/export` — CSV export of attendance
- [ ] 4.6 Socket.io setup — emit `seat:update` and `occupancy:update` on every check-in/out

#### Frontend
- [ ] 4.7 Build `CheckIn.js` page — search student by name/ID, check-in button, live occupancy counter
- [ ] 4.8 QR scanner component (use `html5-qrcode` or `react-qr-reader`)
- [ ] 4.9 Public kiosk page `/kiosk` — student self check-in by ID (no auth required)
- [ ] 4.10 Live occupancy widget on Dashboard (Socket.io powered)
- [ ] 4.11 Attendance log table with date filter + CSV export button

**Deliverable:** Check-in/out fully functional, live seat map updates via Socket.io.

---

### PHASE 5 — Locker Management
**Goal:** Locker grid, assignment, key tracking.

#### Backend
- [ ] 5.1 `GET/POST /api/v1/lockers` — locker inventory CRUD
- [ ] 5.2 `PUT /api/v1/lockers/:id` — update status
- [ ] 5.3 `POST /api/v1/locker-allotments` — assign locker to student
- [ ] 5.4 `PUT /api/v1/locker-allotments/:id` — update (key given/returned)
- [ ] 5.5 `DELETE /api/v1/locker-allotments/:id` — release locker

#### Frontend
- [ ] 5.6 Build `LockerGrid.js` component — visual grid similar to seat map, color-coded
- [ ] 5.7 Build `Lockers.js` page — locker grid + assign/release modal
- [ ] 5.8 Add locker info to student profile page

**Deliverable:** Locker assignment and tracking working.

---

### PHASE 6 — Fee Management
**Goal:** Full fee ledger, payment recording, PDF receipts, outstanding dues.

#### Backend
- [ ] 6.1 `GET /api/v1/fees` — paginated fee list, filterable by status/month/student
- [ ] 6.2 `POST /api/v1/fees` — record payment (amount, mode, reference, date)
- [ ] 6.3 `PUT /api/v1/fees/:id` — update fee record (apply discount/waiver)
- [ ] 6.4 `GET /api/v1/fees/outstanding` — all students with pending/overdue fees
- [ ] 6.5 `GET /api/v1/fees/:id/receipt` — generate PDF receipt (pdfkit or puppeteer)
- [ ] 6.6 `GET /api/v1/fees/summary` — monthly totals: collected, pending
- [ ] 6.7 Auto-create monthly fee records for active students (cron job or on-demand)

#### Frontend
- [ ] 6.8 Build `FeeLedger.js` page matching `FeeLedger.html` mockup:
  - Summary cards: Total Collected, Pending Amount, Active Subscriptions
  - Tabs: Recent Transactions / Outstanding Dues / Refund History
  - Transaction table with receipt download button
  - Fee Reminders mini-card
  - Annual Revenue Forecast bar chart (Recharts)
- [ ] 6.9 Build `NewTransactionModal.js` — record payment form
- [ ] 6.10 PDF receipt download button per transaction
- [ ] 6.11 Outstanding dues list with "Send Reminder" per student

**Deliverable:** Complete fee management with PDF receipts.

---

### PHASE 7 — Notifications & Alarm System
**Goal:** Automated reminders, slot alarms, broadcast messages.

#### Backend
- [ ] 7.1 Install `node-cron` + `nodemailer`
- [ ] 7.2 Daily 9 AM job: check fees due in 7/3/1 days → send email reminders
- [ ] 7.3 Daily 9 AM job: mark overdue fees, send overdue alert emails
- [ ] 7.4 Daily 9 AM job: check slot subscriptions expiring in 5/1 days → notify
- [ ] 7.5 Every-minute job: check if any slot ends in 15 min → emit `alarm:slot_end` via Socket.io
- [ ] 7.6 `POST /api/v1/notifications/broadcast` — admin sends custom message to all/selected students
- [ ] 7.7 `GET /api/v1/notifications` — notification log with status
- [ ] 7.8 `PUT /api/v1/notifications/settings` — configure channels (email/SMS) and timing

#### Frontend
- [ ] 7.9 Notification bell in header — shows unread count, dropdown log
- [ ] 7.10 Build `Notifications.js` page — full notification history table
- [ ] 7.11 Broadcast message form (admin sends to all or filtered students)
- [ ] 7.12 Slot alarm toast/banner (Socket.io `alarm:slot_end` event)

**Deliverable:** Automated email reminders running, slot alarms firing, broadcast working.

---

### PHASE 8 — Configuration Page
**Goal:** Admin configures library hours, slots, fee rules, profile.

#### Backend
- [ ] 8.1 `GET/PUT /api/v1/config` — library settings (name, logo, hours, notification timing)
- [ ] 8.2 `PUT /api/v1/auth/password` — change admin password

#### Frontend
- [ ] 8.3 Build `Configuration.js` page matching `LibraryConfiguration.html` mockup:
  - Opening hours (day checkboxes + open/close time)
  - Time slot definitions (add/edit/delete slots with capacity)
  - Subscription fee rules (monthly/quarterly/annual tiers)
  - Capacity forecasting card
  - Save / Discard buttons
- [ ] 8.4 Admin profile settings (name, email, password change, library logo upload)

**Deliverable:** Admin can fully configure the library system.

---

### PHASE 9 — Reports & Analytics
**Goal:** Revenue dashboard, occupancy analytics, export to CSV/PDF.

#### Backend
- [ ] 9.1 `GET /api/v1/reports/revenue` — daily/monthly/yearly totals
- [ ] 9.2 `GET /api/v1/reports/occupancy` — seat fill rate by slot and by day
- [ ] 9.3 `GET /api/v1/reports/attendance` — per-student monthly attendance %
- [ ] 9.4 `GET /api/v1/reports/fees` — collected vs pending per month
- [ ] 9.5 `GET /api/v1/reports/export` — CSV or PDF of any report

#### Frontend
- [ ] 9.6 Build `Reports.js` page:
  - Revenue chart (Recharts BarChart/LineChart)
  - Occupancy heatmap by slot
  - Student attendance summary table
  - Fee collection chart
  - Export buttons (CSV + PDF)

**Deliverable:** Full analytics and export working.

---

### PHASE 10 — Production Polish & Deployment
**Goal:** Performance, security, mobile responsiveness, deployment.

- [ ] 10.1 Add rate limiting (`express-rate-limit`) to all API routes
- [ ] 10.2 Add helmet.js for security headers
- [ ] 10.3 Add input sanitization (xss-clean or express-validator)
- [ ] 10.4 Add database connection pooling + query timeouts
- [ ] 10.5 Add pagination to all list endpoints (already in spec)
- [ ] 10.6 Mobile responsiveness audit — sidebar collapses to hamburger on mobile
- [ ] 10.7 Loading skeletons on all data tables
- [ ] 10.8 Error boundary components in React
- [ ] 10.9 Environment variable validation on startup
- [ ] 10.10 Write `Dockerfile` + `docker-compose.yml` for local dev
- [ ] 10.11 Configure Railway/Render for backend deployment
- [ ] 10.12 Configure Vercel for frontend deployment
- [ ] 10.13 Set up daily PostgreSQL backup script
- [ ] 10.14 Final QA pass: all modules end-to-end

**Deliverable:** Production-ready, deployed, secure application.

---

## File Structure (Target)

```
adarsh-library/
├── backend/                        # Node.js + Express
│   ├── config/
│   │   ├── database.js             # pg pool
│   │   └── initDatabase.js         # schema + seed
│   ├── db/
│   │   ├── schema.sql              # full PostgreSQL schema
│   │   └── seed.sql                # admin + sample data
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify
│   │   ├── asyncHandler.js         # try/catch wrapper
│   │   └── validate.js             # Joi validation middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── seatRoutes.js
│   │   ├── slotRoutes.js
│   │   ├── checkinRoutes.js
│   │   ├── lockerRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── configRoutes.js
│   ├── services/
│   │   ├── mailer.js               # Nodemailer
│   │   ├── sms.js                  # Twilio (optional)
│   │   ├── pdfGenerator.js         # pdfkit receipts
│   │   └── qrGenerator.js          # qrcode
│   ├── jobs/
│   │   └── scheduler.js            # node-cron jobs
│   ├── socket/
│   │   └── handlers.js             # Socket.io events
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/                       # React
│   ├── src/
│   │   ├── api/                    # axios wrappers per module
│   │   ├── components/
│   │   │   ├── Layout.js           # sidebar + header shell
│   │   │   ├── SeatMap.jsx         # interactive seat grid
│   │   │   ├── LockerGrid.jsx
│   │   │   ├── SlotBadge.jsx
│   │   │   └── FeeReceipt.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── StudentDirectory.js
│   │   │   ├── SeatMap.js
│   │   │   ├── CheckIn.js
│   │   │   ├── Lockers.js
│   │   │   ├── FeeLedger.js
│   │   │   ├── Notifications.js
│   │   │   ├── Reports.js
│   │   │   ├── Configuration.js
│   │   │   └── Kiosk.js            # public self check-in
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   ├── .env
│   └── package.json
│
└── .planning/
```

---

## Priority Order for Implementation

1. **Phase 1** — Foundation (database + Tailwind + layout) — everything depends on this
2. **Phase 2** — Dashboard + Students — core daily use
3. **Phase 3** — Seat Map — most visually complex, high value
4. **Phase 6** — Fee Management — critical business function
5. **Phase 4** — Check-In/Out — daily operations
6. **Phase 8** — Configuration — needed to configure slots/fees
7. **Phase 5** — Lockers — medium priority
8. **Phase 7** — Notifications — high value but can come after core
9. **Phase 9** — Reports — analytics layer
10. **Phase 10** — Production polish + deployment

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| MySQL → PostgreSQL migration | Write schema fresh; no data to migrate yet |
| Tailwind + CRA compatibility | Use `craco` or PostCSS config |
| Socket.io CORS in production | Configure allowed origins via env var |
| PDF generation on server | Use pdfkit (lighter than puppeteer) |
| SMS costs | Default to email only; Twilio is opt-in via env |
| QR check-in on mobile | Use html5-qrcode which works in mobile browsers |
