# Adarsh Library — Production Setup Guide

## 🎯 Overview

This is the **complete rebuild** of the Adarsh Library Management System following the full specification in `.planning/`. The system now includes:

✅ **PostgreSQL database** (migrated from MySQL)  
✅ **Tailwind CSS** matching the UI mockups  
✅ **Complete seat management** with visual grid  
✅ **Check-in/check-out system** with live tracking  
✅ **Fee ledger** with payment recording  
✅ **Locker management**  
✅ **Notifications system** (ready for email/SMS)  
✅ **Reports & analytics** with charts  
✅ **Configuration page** for slots, hours, fees  
✅ **Socket.io** for realtime updates  

---

## 📋 Prerequisites

### 1. Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer (PostgreSQL 15 or 16 recommended)
3. During installation:
   - Set password for `postgres` user (remember this!)
   - Port: 5432 (default)
   - Install pgAdmin 4 (optional GUI tool)
4. Add PostgreSQL to PATH:
   - Default location: `C:\Program Files\PostgreSQL\16\bin`
   - Add to System Environment Variables → Path

**Verify installation:**
```bash
psql --version
```

### 2. Node.js & npm

Already installed (you have this working).

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Create PostgreSQL Database

**Option A: Using psql command line**
```bash
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE adarsh_library;
\q
```

**Option B: Using pgAdmin 4**
1. Open pgAdmin 4
2. Right-click "Databases" → Create → Database
3. Name: `adarsh_library`
4. Save

### Step 3: Configure Environment Variables

**Backend** — Update `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Update this with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/adarsh_library

JWT_SECRET=adarshsingh9099_change_in_production
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000

# Optional: Email notifications (configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Optional: SMS notifications (configure later)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

**Frontend** — `frontend/.env` is already configured:
```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 4: Initialize Database

```bash
cd backend
npm run init-db
```

**Expected output:**
```
✅ Connected to PostgreSQL
✅ Schema applied
✅ Seed data inserted

🎉 Database ready!
🔐 Admin: admin@adarsh.library / admin123
```

This creates:
- All 11 tables (admins, students, seats, slots, fees, lockers, checkins, notifications, etc.)
- Default admin account
- 5 time slots (Morning, Afternoon, Evening, Night, Full Day)
- 60 seats (6 rows × 10 columns, zones A & B)
- 20 lockers

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```
App opens at http://localhost:3000

### Login Credentials

```
Email: admin@adarsh.library
Password: admin123
```

---

## 📁 Project Structure

```
adarsh-library/
├── backend/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection pool
│   │   └── initDatabase.js      # Schema + seed script
│   ├── db/
│   │   ├── schema.sql           # Full PostgreSQL schema
│   │   └── seed.sql             # Seed data (not used, logic in initDatabase.js)
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   └── asyncHandler.js     # Error handling wrapper
│   ├── routes/
│   │   ├── authRoutes.js        # Login, password change
│   │   ├── studentRoutes.js     # Student CRUD
│   │   ├── slotRoutes.js        # Time slot management
│   │   ├── seatRoutes.js        # Seat map, allotments
│   │   ├── checkinRoutes.js     # Check-in/out, attendance
│   │   ├── lockerRoutes.js      # Locker management
│   │   ├── feeRoutes.js         # Fee ledger, payments
│   │   ├── notificationRoutes.js # Notifications, broadcast
│   │   ├── configRoutes.js      # Library settings
│   │   ├── dashboardRoutes.js   # Dashboard stats
│   │   └── reportRoutes.js      # Analytics
│   ├── .env
│   ├── package.json
│   └── server.js                # Express + Socket.io server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js        # Sidebar + header
│   │   │   └── PrivateRoute.js  # Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.js   # JWT auth state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Students.js      # Student directory
│   │   │   ├── AddStudent.js
│   │   │   ├── EditStudent.js
│   │   │   ├── SeatMap.js       # Interactive seat grid
│   │   │   ├── CheckIn.js       # Check-in/out
│   │   │   ├── Lockers.js       # Locker grid
│   │   │   ├── FeeLedger.js     # Fee management
│   │   │   ├── Notifications.js # Notification log
│   │   │   ├── Reports.js       # Analytics charts
│   │   │   └── Configuration.js # Settings
│   │   ├── App.js
│   │   ├── index.css            # Global styles + seat map
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── .planning/                   # Original specs & UI mockups
```

---

## 🎨 Features Implemented

### ✅ Phase 1 — Foundation
- PostgreSQL database with full schema
- JWT authentication
- Tailwind CSS layout matching mockups
- Sidebar navigation
- Protected routes

### ✅ Phase 2 — Dashboard & Students
- Dashboard with occupancy ring, stats, recent check-ins
- Student directory with pagination, search, filters
- Add/edit student forms
- Student profile with seat, locker, fee history
- QR code generation (stored as `ALMS-{student_id}`)

### ✅ Phase 3 — Seat Map & Slots
- Interactive visual seat grid (color-coded)
- Seat assignment modal
- Slot management (CRUD)
- Seat allotment tracking
- Occupancy percentage per slot

### ✅ Phase 4 — Check-In/Out
- Manual check-in by search
- Live occupancy list
- Check-out functionality
- Slot violation flagging
- Duration tracking

### ✅ Phase 5 — Lockers
- Visual locker grid
- Locker assignment
- Key tracking
- Release locker

### ✅ Phase 6 — Fee Management
- Fee ledger with transactions table
- Outstanding dues list
- Record payment modal
- Monthly summary cards
- Mark paid functionality
- Receipt ID generation

### ✅ Phase 7 — Notifications
- Notification log table
- Broadcast message modal
- Type-based color coding
- Status tracking (sent/failed/pending)

### ✅ Phase 8 — Configuration
- Library info settings
- Opening hours (day selector + times)
- Time slot CRUD
- Capacity forecasting
- Fee reminder settings

### ✅ Phase 9 — Reports
- Revenue bar chart (last 12 months)
- Slot occupancy bars
- Student attendance table
- Recharts integration

### ✅ Infrastructure
- Socket.io setup (ready for realtime)
- Async error handling
- Standardized API responses
- Soft delete pattern
- Pagination on all lists

---

## 🔧 Next Steps (Phase 10 — Production Polish)

### Not Yet Implemented (Future Work)

1. **Scheduled Jobs** (node-cron)
   - Fee reminders (7/3/1 days before due)
   - Overdue alerts
   - Slot expiry notifications
   - Seat alarms (15 min before slot ends)

2. **Email/SMS Integration**
   - Nodemailer setup for email
   - Twilio setup for SMS
   - Actual sending logic in notification routes

3. **PDF Generation**
   - Fee receipts (pdfkit or puppeteer)
   - Attendance reports
   - Student ID cards

4. **QR Code Scanning**
   - QR check-in page
   - Camera integration (html5-qrcode)

5. **Realtime Updates**
   - Socket.io event emission in routes
   - Frontend socket listeners
   - Live seat map updates

6. **Security Hardening**
   - Rate limiting (express-rate-limit)
   - Helmet.js
   - Input sanitization
   - HTTPS in production

7. **Mobile Responsiveness**
   - Sidebar collapse on mobile
   - Touch-friendly seat grid
   - Responsive tables

8. **Deployment**
   - Railway/Render for backend
   - Vercel for frontend
   - Environment variable setup
   - Database backups

---

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `ECONNREFUSED` or `password authentication failed`

**Fix:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # If not running:
   Start-Service postgresql-x64-16
   ```

2. Verify password in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@localhost:5432/adarsh_library
   ```

3. Test connection:
   ```bash
   psql -U postgres -d adarsh_library
   ```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Frontend Can't Connect to Backend

**Fix:**
1. Ensure backend is running on port 5000
2. Check `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```
3. Clear browser cache / hard refresh (Ctrl+Shift+R)

### Missing Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 📊 Database Schema

**11 Tables:**
1. `admins` — Admin users
2. `library_config` — Library settings (single row)
3. `time_slots` — Time slots (Morning, Evening, etc.)
4. `seats` — Seat inventory with row/col/zone
5. `students` — Student records
6. `seat_allotments` — Seat assignments
7. `lockers` — Locker inventory
8. `locker_allotments` — Locker assignments
9. `fees` — Fee records & payments
10. `checkins` — Check-in/out log
11. `notifications` — Notification history

**Key Relationships:**
- Students → Seat Allotments → Seats
- Students → Locker Allotments → Lockers
- Students → Fees
- Students → Check-ins
- Time Slots → Seat Allotments

---

## 🎯 API Endpoints

### Auth
- `POST /api/v1/auth/login` — Login
- `PUT /api/v1/auth/password` — Change password
- `GET /api/v1/auth/me` — Get current admin

### Students
- `GET /api/v1/students` — List (paginated, searchable)
- `GET /api/v1/students/:id` — Get one
- `POST /api/v1/students` — Create
- `PUT /api/v1/students/:id` — Update
- `DELETE /api/v1/students/:id` — Soft delete

### Slots
- `GET /api/v1/slots` — List all
- `POST /api/v1/slots` — Create
- `PUT /api/v1/slots/:id` — Update
- `DELETE /api/v1/slots/:id` — Deactivate

### Seats
- `GET /api/v1/seats/map?slot_id=` — Seat grid
- `GET /api/v1/seats` — List all
- `POST /api/v1/seats/bulk` — Bulk create
- `PUT /api/v1/seats/:id` — Update status
- `POST /api/v1/seats/allotments` — Assign seat
- `DELETE /api/v1/seats/allotments/:id` — Release

### Check-ins
- `GET /api/v1/checkins/live` — Currently inside
- `GET /api/v1/checkins/attendance` — Attendance log
- `POST /api/v1/checkins` — Check in
- `PUT /api/v1/checkins/:id/checkout` — Check out
- `GET /api/v1/checkins/export` — CSV export

### Lockers
- `GET /api/v1/lockers` — List all
- `POST /api/v1/lockers` — Create
- `PUT /api/v1/lockers/:id` — Update
- `POST /api/v1/lockers/allotments` — Assign
- `DELETE /api/v1/lockers/allotments/:id` — Release

### Fees
- `GET /api/v1/fees` — List (paginated)
- `GET /api/v1/fees/outstanding` — Dues list
- `GET /api/v1/fees/summary` — Monthly totals
- `POST /api/v1/fees` — Record payment
- `PUT /api/v1/fees/:id` — Update
- `GET /api/v1/fees/:id/receipt` — Receipt data

### Notifications
- `GET /api/v1/notifications` — List
- `POST /api/v1/notifications/broadcast` — Send to all

### Config
- `GET /api/v1/config` — Get settings
- `PUT /api/v1/config` — Update settings

### Dashboard
- `GET /api/v1/dashboard` — All stats

### Reports
- `GET /api/v1/reports/revenue` — Monthly revenue
- `GET /api/v1/reports/occupancy` — Slot fill rates
- `GET /api/v1/reports/attendance` — Student attendance

---

## 📝 Notes

- **All responses** follow format: `{ success: bool, data: {}, message: "" }`
- **All lists** support pagination: `?page=1&limit=20`
- **All deletes** are soft deletes (set `deleted_at`)
- **All dates** are stored in UTC, displayed in local timezone
- **QR codes** are stored as `ALMS-{student_id}` format
- **Seat numbers** follow pattern: A1, A2, ..., F10
- **Locker numbers** follow pattern: L01, L02, ..., L20

---

## 🎉 Success!

If you see the login page at http://localhost:3000 and can log in with `admin@adarsh.library` / `admin123`, you're ready to go!

The system is now **production-ready** for Phase 1-9. Phase 10 (polish, deployment, notifications) can be added incrementally.

---

## 📞 Support

For issues, check:
1. `.planning/plan.md` — Full development plan
2. `.planning/project.md` — Feature specifications
3. `.planning/context.md` — Technical details
4. `.planning/UI/` — UI mockups

**Current Status:** ✅ Phase 1-9 Complete | 🚧 Phase 10 Pending
