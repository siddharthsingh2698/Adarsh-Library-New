# Adarsh Library — Project Specification

## Project Name
**Adarsh Library Management System (ALMS)**

## Goal
Replace manual register-keeping with a digital system that handles every aspect of running a study library: students, seats, time slots, fees, lockers, check-in/check-out, and automated notifications — all from a single clean web dashboard.

---

## Modules & Task Breakdown

---

### MODULE 1: Admin Auth & Setup
> Phase 1 | Priority: Critical

| # | Task | Notes |
|---|---|---|
| 1.1 | Admin login page (email + password) | JWT-based, remember me |
| 1.2 | Protected route middleware | All API routes require token |
| 1.3 | Admin profile settings | Change password, library name, logo |
| 1.4 | Library configuration | Set opening hours, slot definitions, fee rules |

---

### MODULE 2: Student Management
> Phase 1 | Priority: Critical

| # | Task | Notes |
|---|---|---|
| 2.1 | Add new student form | Name, phone, email, photo, address, ID proof |
| 2.2 | Student list with search & filter | Filter by slot, status, fee due |
| 2.3 | Student profile page | All details, seat, locker, fees, history |
| 2.4 | Edit / deactivate student | Soft delete; preserve history |
| 2.5 | Student ID card generation | Printable card with QR code |

---

### MODULE 3: Time Slot Management
> Phase 2 | Priority: Critical

| # | Task | Notes |
|---|---|---|
| 3.1 | Define time slots | e.g. 6–10 AM, 10 AM–2 PM, 2–6 PM, 6–10 PM, Full Day |
| 3.2 | Slot capacity settings | Max seats per slot |
| 3.3 | Slot fee configuration | Per slot monthly pricing |
| 3.4 | View slot occupancy at a glance | How many seats filled vs available |
| 3.5 | Slot-wise student list | Who is assigned to which slot |

---

### MODULE 4: Seat Allotment & Visual Diagram
> Phase 2 | Priority: Critical

| # | Task | Notes |
|---|---|---|
| 4.1 | Define seat layout (rows × columns) | Admin configures floor plan shape |
| 4.2 | Visual seat map (interactive grid) | Color-coded: Green=free, Red=taken, Yellow=reserved, Grey=maintenance |
| 4.3 | Assign seat to student + slot | Click seat → assign modal |
| 4.4 | Seat swap between students | Drag or form-based |
| 4.5 | Mark seat under maintenance | Temporarily unavailable |
| 4.6 | Seat history log | Who occupied which seat when |

---

### MODULE 5: Check-In / Check-Out System
> Phase 3 | Priority: High

| # | Task | Notes |
|---|---|---|
| 5.1 | Admin check-in panel | Search student by name/ID → check in |
| 5.2 | QR code check-in | Scan QR on student ID card |
| 5.3 | Student self check-in page | Public kiosk URL; student enters ID |
| 5.4 | Check-out flow | Mark exit time |
| 5.5 | Live occupancy view | Real-time count of students currently inside |
| 5.6 | Slot violation detection | Student checked in outside their slot — flag/alert |
| 5.7 | Daily attendance log | Date-wise list of check-ins/outs |
| 5.8 | Attendance report export | CSV / PDF per student or per day |

---

### MODULE 6: Locker Management
> Phase 4 | Priority: Medium

| # | Task | Notes |
|---|---|---|
| 6.1 | Define locker inventory | Number of lockers, numbering scheme |
| 6.2 | Visual locker grid | Similar to seat map — color-coded |
| 6.3 | Assign locker to student | Optional add-on, additional charge |
| 6.4 | Locker fee tracking | Separate from seat fee |
| 6.5 | Release locker | On student exit or fee default |
| 6.6 | Locker key status | Key given / returned tracking |

---

### MODULE 7: Fee Management
> Phase 5 | Priority: Critical

| # | Task | Notes |
|---|---|---|
| 7.1 | Fee plans setup | Monthly, quarterly, annual; per slot |
| 7.2 | Record payment | Amount, mode (cash/UPI/bank), date, reference |
| 7.3 | Outstanding dues dashboard | List of all students with dues |
| 7.4 | Individual fee ledger | Full payment history per student |
| 7.5 | Fee receipt generation | PDF receipt with library branding |
| 7.6 | Advance payment support | Record payment for future months |
| 7.7 | Fee discount / waiver | Admin can apply one-time discount |
| 7.8 | Monthly closing summary | Total collected, total pending |

---

### MODULE 8: Notification & Alarm System
> Phase 6 | Priority: High

| # | Task | Notes |
|---|---|---|
| 8.1 | Fee reminder scheduler | Auto-send 7, 3, 1 day(s) before due date via email/SMS |
| 8.2 | Overdue fee alert | Send on the day fee becomes overdue |
| 8.3 | Slot expiry reminder | Notify student N days before slot subscription ends |
| 8.4 | Seat alarm (slot end) | Push / SMS alert when slot time is about to end |
| 8.5 | Admin broadcast message | Send custom message to all / selected students |
| 8.6 | Notification log | Full history of all sent notifications |
| 8.7 | Notification settings | Admin configures channels (email/SMS) and timing |

---

### MODULE 9: Reports & Analytics
> Phase 7 | Priority: Medium

| # | Task | Notes |
|---|---|---|
| 9.1 | Revenue dashboard | Today / this month / this year collected |
| 9.2 | Occupancy analytics | Seat fill rate by slot, by day |
| 9.3 | Student attendance summary | Per-student monthly attendance % |
| 9.4 | Fee collection report | Collected vs pending per month |
| 9.5 | Export all reports | CSV & PDF |

---

## UI/UX Principles
- **Clean & minimal** — no clutter; information hierarchy is king
- **Color system**: Neutral base (white/slate), accent color (library brand)
- **Status always visible**: Seat map, today's occupancy, dues alert at a glance
- **Mobile-friendly**: Admin should be able to operate from phone
- **Fast**: All list views paginated; search is instant

---

## Deliverables per Phase

| Phase | Deliverable |
|---|---|
| 1 | Working auth, student CRUD, dashboard shell |
| 2 | Seat map, slot management, seat allotment |
| 3 | Check-in/out system, live occupancy, attendance |
| 4 | Locker grid, locker assignment & tracking |
| 5 | Fee ledger, payment recording, PDF receipts |
| 6 | Automated reminders, slot alarms, broadcast |
| 7 | Reports, analytics, CSV/PDF export, polish |