# Adarsh Library — Technical Context

## Repository Structure

```
adarsh-library/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Seats.jsx
│   │   │   ├── Slots.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── Lockers.jsx
│   │   │   ├── CheckIn.jsx
│   │   │   ├── Notifications.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/
│   │   │   ├── SeatMap.jsx       # Visual interactive seat grid
│   │   │   ├── LockerGrid.jsx
│   │   │   ├── FeeReceipt.jsx
│   │   │   ├── SlotBadge.jsx
│   │   │   └── NotifLog.jsx
│   │   ├── hooks/
│   │   ├── store/                # Zustand global state
│   │   └── api/                  # Axios API wrappers
│   └── public/
│
├── server/                     # Node.js + Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── seats.js
│   │   ├── slots.js
│   │   ├── fees.js
│   │   ├── lockers.js
│   │   ├── checkin.js
│   │   └── notifications.js
│   ├── models/                  # Sequelize ORM models
│   ├── jobs/                    # node-cron scheduled tasks
│   ├── services/
│   │   ├── mailer.js
│   │   ├── sms.js
│   │   └── pdfGenerator.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── socket/                  # Socket.io handlers
│
└── docs/
    ├── plan.md
    ├── project.md
    └── context.md
```

---

## Database Schema

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | bcrypt |
| created_at | TIMESTAMP | |

---

### `students`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | |
| phone | VARCHAR | |
| email | VARCHAR | |
| photo_url | VARCHAR | |
| address | TEXT | |
| id_proof_url | VARCHAR | |
| qr_code | VARCHAR | For check-in |
| status | ENUM | active / inactive |
| joined_at | DATE | |
| created_at | TIMESTAMP | |

---

### `time_slots`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | e.g. "Morning Slot" |
| start_time | TIME | e.g. 06:00 |
| end_time | TIME | e.g. 10:00 |
| monthly_fee | DECIMAL | |
| capacity | INT | Max seats in this slot |
| is_active | BOOLEAN | |

---

### `seats`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| seat_number | VARCHAR | e.g. A1, B3 |
| row | INT | Grid row |
| col | INT | Grid column |
| status | ENUM | available / occupied / reserved / maintenance |

---

### `seat_allotments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id | UUID FK | |
| seat_id | UUID FK | |
| slot_id | UUID FK | |
| start_date | DATE | |
| end_date | DATE | |
| is_active | BOOLEAN | |

---

### `lockers`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| locker_number | VARCHAR | |
| status | ENUM | available / assigned / maintenance |
| monthly_fee | DECIMAL | |

---

### `locker_allotments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id | UUID FK | |
| locker_id | UUID FK | |
| start_date | DATE | |
| end_date | DATE | |
| key_given | BOOLEAN | |
| is_active | BOOLEAN | |

---

### `fees`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id | UUID FK | |
| slot_id | UUID FK | |
| locker_id | UUID FK (nullable) | |
| amount | DECIMAL | |
| due_date | DATE | |
| paid_date | DATE (nullable) | |
| payment_mode | ENUM | cash / upi / bank / waiver |
| reference | VARCHAR | UPI ref or bank txn id |
| status | ENUM | paid / pending / overdue / waived |
| receipt_url | VARCHAR | PDF path |
| notes | TEXT | |

---

### `checkins`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id | UUID FK | |
| seat_id | UUID FK | |
| slot_id | UUID FK | |
| check_in_at | TIMESTAMP | |
| check_out_at | TIMESTAMP (nullable) | |
| method | ENUM | manual / qr / self |
| flagged | BOOLEAN | Outside-slot violation |

---

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| student_id | UUID FK (nullable) | null = broadcast |
| type | ENUM | fee_reminder / overdue / slot_expiry / seat_alarm / broadcast |
| channel | ENUM | email / sms / both |
| message | TEXT | |
| sent_at | TIMESTAMP | |
| status | ENUM | sent / failed / pending |

---

## API Conventions

- Base URL: `/api/v1`
- Auth header: `Authorization: Bearer <token>`
- All responses: `{ success: bool, data: {}, message: "" }`
- Pagination: `?page=1&limit=20` on all list endpoints
- Soft delete: All records use `deleted_at` timestamp, never hard-deleted

---

## Scheduled Jobs (node-cron)

| Job | Schedule | Action |
|---|---|---|
| Fee reminder | Daily 9 AM | Check dues in 7/3/1 days → notify |
| Overdue check | Daily 9 AM | Mark overdue, send alert |
| Slot expiry reminder | Daily 9 AM | Subscription ending in 5/1 days |
| Seat alarm | Every minute | Check if slot ending in 15 min → notify |
| Daily report | Daily 11 PM | Generate & store summary |

---

## Notification Channels

### Email (Nodemailer + SMTP)
- Fee due reminders
- Receipt on payment
- Slot expiry warning

### SMS (Twilio / MSG91)
- Seat alarm (slot ending soon)
- Overdue fee urgent alert
- OTP for QR check-in (optional)

---

## Realtime (Socket.io)

| Event | Trigger | Payload |
|---|---|---|
| `seat:update` | Check-in/out | `{ seatId, status }` |
| `occupancy:update` | Any check-in/out | `{ slotId, count }` |
| `alarm:slot_end` | 15 min before slot end | `{ studentId, slotName, endTime }` |

---

## Key Business Rules

1. A student can hold only **one active seat allotment** at a time.
2. A student can hold only **one active locker** at a time.
3. Check-in outside allotted slot is **flagged** but not blocked (admin decides).
4. Fees are created **monthly** in advance; overdue if unpaid by due_date.
5. Seat is released automatically when allotment `end_date` passes.
6. Locker is released when student deactivated or end_date passed.
7. Notification preference (email/SMS/both) is configurable per student.
8. All deletes are **soft deletes** — data is never erased.

---

## Environment Variables

```env
# Server
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/adarsh_library
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=library@gmail.com
SMTP_PASS=app_password

# SMS (optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Client
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## Coding Conventions

- **Frontend**: Functional components, Zustand for global state, React Query for server state
- **Backend**: Controller → Service → Model pattern
- **Naming**: camelCase JS, snake_case DB columns
- **Error handling**: All async routes wrapped in `asyncHandler`; global error middleware
- **Validation**: Zod on frontend, Joi on backend
- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)