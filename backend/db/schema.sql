-- Adarsh Library Management System — PostgreSQL Schema
-- Run this file to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library config (single row)
CREATE TABLE IF NOT EXISTS library_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  library_name VARCHAR(100) DEFAULT 'Adarsh Library',
  logo_url VARCHAR(500),
  open_time TIME DEFAULT '06:00',
  close_time TIME DEFAULT '22:00',
  open_days JSONB DEFAULT '["Mon","Tue","Wed","Thu","Fri"]',
  fee_reminder_days JSONB DEFAULT '[7,3,1]',
  notification_channel VARCHAR(10) DEFAULT 'email',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time slots
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seats
CREATE TABLE IF NOT EXISTS seats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seat_number VARCHAR(20) UNIQUE NOT NULL,
  row_num INT NOT NULL,
  col_num INT NOT NULL,
  zone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','maintenance')),
  has_power BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  photo_url VARCHAR(500),
  address TEXT,
  id_proof_url VARCHAR(500),
  qr_code TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  notification_channel VARCHAR(10) DEFAULT 'email',
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seat allotments
CREATE TABLE IF NOT EXISTS seat_allotments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  seat_id UUID NOT NULL REFERENCES seats(id),
  slot_id UUID NOT NULL REFERENCES time_slots(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lockers
CREATE TABLE IF NOT EXISTS lockers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locker_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available','assigned','maintenance')),
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locker allotments
CREATE TABLE IF NOT EXISTS locker_allotments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  locker_id UUID NOT NULL REFERENCES lockers(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  key_given BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fees
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  slot_id UUID REFERENCES time_slots(id),
  locker_id UUID REFERENCES lockers(id),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_mode VARCHAR(20) CHECK (payment_mode IN ('cash','upi','bank','waiver')),
  reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue','waived')),
  receipt_url VARCHAR(500),
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id),
  seat_id UUID REFERENCES seats(id),
  slot_id UUID REFERENCES time_slots(id),
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  method VARCHAR(20) DEFAULT 'manual' CHECK (method IN ('manual','qr','self')),
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  type VARCHAR(30) CHECK (type IN ('fee_reminder','overdue','slot_expiry','seat_alarm','broadcast')),
  channel VARCHAR(10) CHECK (channel IN ('email','sms','both')),
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('sent','failed','pending'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_seat_allotments_student ON seat_allotments(student_id);
CREATE INDEX IF NOT EXISTS idx_seat_allotments_active ON seat_allotments(is_active);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_checkins_student ON checkins(student_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(check_in_at);
