require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function init() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const db = process.env.DB_NAME || 'adarsh_library';
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
    await conn.query(`USE \`${db}\``);
    console.log(`✅ Database "${db}" ready`);

    // ── Tables (UUID stored as VARCHAR(36), generated in app) ────────────

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id            VARCHAR(36)  NOT NULL PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS library_config (
        id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
        library_name         VARCHAR(100) DEFAULT 'Adarsh Library',
        logo_url             VARCHAR(500),
        open_time            TIME         DEFAULT '06:00:00',
        close_time           TIME         DEFAULT '22:00:00',
        open_days            JSON,
        fee_reminder_days    JSON,
        notification_channel VARCHAR(10)  DEFAULT 'email',
        updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id          VARCHAR(36)    NOT NULL PRIMARY KEY,
        name        VARCHAR(100)   NOT NULL,
        start_time  TIME           NOT NULL,
        end_time    TIME           NOT NULL,
        monthly_fee DECIMAL(10,2)  NOT NULL DEFAULT 0,
        capacity    INT            NOT NULL DEFAULT 50,
        is_active   TINYINT(1)     DEFAULT 1,
        created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id          VARCHAR(36)  NOT NULL PRIMARY KEY,
        seat_number VARCHAR(20)  NOT NULL UNIQUE,
        row_num     INT          NOT NULL,
        col_num     INT          NOT NULL,
        zone        VARCHAR(50),
        status      ENUM('available','occupied','reserved','maintenance') DEFAULT 'available',
        has_power   TINYINT(1)   DEFAULT 0,
        created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id                   VARCHAR(36)  NOT NULL PRIMARY KEY,
        name                 VARCHAR(100) NOT NULL,
        phone                VARCHAR(20)  NOT NULL,
        email                VARCHAR(255),
        photo_url            VARCHAR(500),
        address              TEXT,
        id_proof_url         VARCHAR(500),
        qr_code              VARCHAR(255),
        status               ENUM('active','inactive') DEFAULT 'active',
        notification_channel VARCHAR(10)  DEFAULT 'email',
        joined_at            DATE         NOT NULL,
        deleted_at           TIMESTAMP    NULL DEFAULT NULL,
        created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS seat_allotments (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        student_id VARCHAR(36)  NOT NULL,
        seat_id    VARCHAR(36)  NOT NULL,
        slot_id    VARCHAR(36)  NOT NULL,
        start_date DATE         NOT NULL,
        end_date   DATE         NOT NULL,
        is_active  TINYINT(1)   DEFAULT 1,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (seat_id)    REFERENCES seats(id),
        FOREIGN KEY (slot_id)    REFERENCES time_slots(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS lockers (
        id            VARCHAR(36)   NOT NULL PRIMARY KEY,
        locker_number VARCHAR(20)   NOT NULL UNIQUE,
        status        ENUM('available','assigned','maintenance') DEFAULT 'available',
        monthly_fee   DECIMAL(10,2) DEFAULT 0,
        created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS locker_allotments (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        student_id VARCHAR(36)  NOT NULL,
        locker_id  VARCHAR(36)  NOT NULL,
        start_date DATE         NOT NULL,
        end_date   DATE         NOT NULL,
        key_given  TINYINT(1)   DEFAULT 0,
        is_active  TINYINT(1)   DEFAULT 1,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (locker_id)  REFERENCES lockers(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id           VARCHAR(36)   NOT NULL PRIMARY KEY,
        student_id   VARCHAR(36)   NOT NULL,
        slot_id      VARCHAR(36)   NULL,
        locker_id    VARCHAR(36)   NULL,
        amount       DECIMAL(10,2) NOT NULL,
        due_date     DATE          NOT NULL,
        paid_date    DATE          NULL,
        payment_mode ENUM('cash','upi','bank','waiver') NULL,
        reference    VARCHAR(255),
        status       ENUM('paid','pending','overdue','waived') DEFAULT 'pending',
        receipt_url  VARCHAR(500),
        notes        TEXT,
        deleted_at   TIMESTAMP     NULL DEFAULT NULL,
        created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id           VARCHAR(36)  NOT NULL PRIMARY KEY,
        student_id   VARCHAR(36)  NOT NULL,
        seat_id      VARCHAR(36)  NULL,
        slot_id      VARCHAR(36)  NULL,
        check_in_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        check_out_at TIMESTAMP    NULL DEFAULT NULL,
        method       ENUM('manual','qr','self') DEFAULT 'manual',
        flagged      TINYINT(1)   DEFAULT 0,
        created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         VARCHAR(36)  NOT NULL PRIMARY KEY,
        student_id VARCHAR(36)  NULL,
        type       ENUM('fee_reminder','overdue','slot_expiry','seat_alarm','broadcast'),
        channel    ENUM('email','sms','both'),
        message    TEXT         NOT NULL,
        sent_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        status     ENUM('sent','failed','pending') DEFAULT 'pending'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ All tables created');

    // ── Seed admin ───────────────────────────────────────────────────────
    const [admins] = await conn.query(
      'SELECT id FROM admins WHERE email = ?', ['admin@adarsh.library']
    );
    if (!admins.length) {
      const hash = await bcrypt.hash('admin123', 10);
      const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
      await conn.query(
        'INSERT INTO admins (id, name, email, password_hash) VALUES (?,?,?,?)',
        [uuid, 'Admin', 'admin@adarsh.library', hash]
      );
      console.log('✅ Admin created  →  admin@adarsh.library / admin123');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // ── Seed library config ──────────────────────────────────────────────
    const [cfg] = await conn.query('SELECT id FROM library_config LIMIT 1');
    if (!cfg.length) {
      const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
      await conn.query(
        `INSERT INTO library_config (id, library_name, open_time, close_time, open_days, fee_reminder_days)
         VALUES (?,?,?,?,?,?)`,
        [uuid, 'Adarsh Library', '06:00:00', '22:00:00',
         JSON.stringify(['Mon','Tue','Wed','Thu','Fri']),
         JSON.stringify([7,3,1])]
      );
    }

    // ── Seed time slots ──────────────────────────────────────────────────
    const [slots] = await conn.query('SELECT id FROM time_slots LIMIT 1');
    if (!slots.length) {
      const slotData = [
        ['Morning',   '06:00:00', '10:00:00', 800.00,  60],
        ['Afternoon', '10:00:00', '14:00:00', 800.00,  60],
        ['Evening',   '14:00:00', '18:00:00', 800.00,  60],
        ['Full Day',  '06:00:00', '22:00:00', 2500.00, 30],
      ];
      for (const [name, start, end, fee, cap] of slotData) {
        const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
        await conn.query(
          'INSERT INTO time_slots (id, name, start_time, end_time, monthly_fee, capacity) VALUES (?,?,?,?,?,?)',
          [uuid, name, start, end, fee, cap]
        );
      }
      console.log('✅ Time slots seeded');
    }

    // ── Seed seats (8 rows × 12 cols = 96 seats numbered 1-96) ──────────
    const [existSeats] = await conn.query('SELECT id FROM seats LIMIT 1');
    if (!existSeats.length) {
      for (let i = 1; i <= 96; i++) {
        const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
        const row = Math.ceil(i / 12);
        const col = ((i - 1) % 12) + 1;
        const zone = i <= 48 ? 'Zone A' : 'Zone B';
        const hasLocker = (i >= 9 && i <= 27) ? 1 : 0;
        await conn.query(
          'INSERT INTO seats (id, seat_number, row_num, col_num, zone, has_power, has_locker) VALUES (?,?,?,?,?,?,?)',
          [uuid, String(i), row, col, zone, i % 4 === 0 ? 1 : 0, hasLocker]
        );
      }
      console.log('✅ 96 seats seeded (1-96)');
    }

    // ── Seed lockers ─────────────────────────────────────────────────────
    const [existLockers] = await conn.query('SELECT id FROM lockers LIMIT 1');
    if (!existLockers.length) {
      for (let i = 1; i <= 20; i++) {
        const [[{ uuid }]] = await conn.query('SELECT UUID() AS uuid');
        await conn.query(
          'INSERT INTO lockers (id, locker_number, monthly_fee) VALUES (?,?,?)',
          [uuid, `L${String(i).padStart(2,'0')}`, 200.00]
        );
      }
      console.log('✅ 20 lockers seeded');
    }

    console.log('\n🎉 Database ready!');
    console.log('🔐 Login: admin@adarsh.library / admin123');

  } catch (err) {
    console.error('❌ Init error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

init();
