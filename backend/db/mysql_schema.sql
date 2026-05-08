-- Adarsh Library — MySQL Schema for Railway
-- Paste this into Railway's Database > Data query box

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_config (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  library_name VARCHAR(100) DEFAULT 'Adarsh Library',
  logo_url VARCHAR(500),
  open_time TIME DEFAULT '06:00:00',
  close_time TIME DEFAULT '22:00:00',
  open_days JSON,
  fee_reminder_days JSON,
  notification_channel VARCHAR(10) DEFAULT 'email',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_slots (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity INT NOT NULL DEFAULT 50,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seats (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  seat_number VARCHAR(20) NOT NULL UNIQUE,
  row_num INT NOT NULL,
  col_num INT NOT NULL,
  zone VARCHAR(50),
  status ENUM('available','occupied','reserved','maintenance') DEFAULT 'available',
  has_power TINYINT(1) DEFAULT 0,
  has_locker TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  photo_url VARCHAR(500),
  address TEXT,
  id_proof_url VARCHAR(500),
  qr_code VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  notification_channel VARCHAR(10) DEFAULT 'email',
  joined_at DATE NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seat_allotments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  seat_id VARCHAR(36) NOT NULL,
  slot_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (seat_id) REFERENCES seats(id),
  FOREIGN KEY (slot_id) REFERENCES time_slots(id)
);

CREATE TABLE IF NOT EXISTS lockers (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  locker_number VARCHAR(20) NOT NULL UNIQUE,
  status ENUM('available','assigned','maintenance') DEFAULT 'available',
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locker_allotments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  locker_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  key_given TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (locker_id) REFERENCES lockers(id)
);

CREATE TABLE IF NOT EXISTS fees (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  slot_id VARCHAR(36) NULL,
  locker_id VARCHAR(36) NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE NULL,
  payment_mode ENUM('cash','upi','bank','waiver') NULL,
  reference VARCHAR(255),
  status ENUM('paid','pending','overdue','waived') DEFAULT 'pending',
  receipt_url VARCHAR(500),
  notes TEXT,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS checkins (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  seat_id VARCHAR(36) NULL,
  slot_id VARCHAR(36) NULL,
  check_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_at TIMESTAMP NULL DEFAULT NULL,
  method ENUM('manual','qr','self') DEFAULT 'manual',
  flagged TINYINT(1) DEFAULT 0,
  overtime_notified TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  student_id VARCHAR(36) NULL,
  type ENUM('fee_reminder','overdue','slot_expiry','seat_alarm','broadcast'),
  channel ENUM('email','sms','both'),
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent','failed','pending') DEFAULT 'pending'
);
