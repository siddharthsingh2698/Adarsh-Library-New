-- Adarsh Library — Seed Data
-- Run AFTER schema.sql

-- Default admin (password: admin123)
INSERT INTO admins (name, email, password_hash)
VALUES ('Admin', 'admin@adarsh.library', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (email) DO NOTHING;

-- Library config
INSERT INTO library_config (library_name, open_time, close_time)
VALUES ('Adarsh Library', '06:00', '22:00')
ON CONFLICT DO NOTHING;

-- Default time slots
INSERT INTO time_slots (name, start_time, end_time, monthly_fee, capacity) VALUES
  ('Morning',   '06:00', '10:00', 800.00,  60),
  ('Afternoon', '10:00', '14:00', 800.00,  60),
  ('Evening',   '14:00', '18:00', 800.00,  60),
  ('Night',     '18:00', '22:00', 800.00,  60),
  ('Full Day',  '06:00', '22:00', 2500.00, 30)
ON CONFLICT DO NOTHING;

-- Default seats (6 rows × 10 cols = 60 seats, two zones)
DO $$
DECLARE
  r INT; c INT;
  zone_name TEXT;
  seat_label TEXT;
BEGIN
  FOR r IN 1..6 LOOP
    FOR c IN 1..10 LOOP
      IF c <= 5 THEN zone_name := 'Zone A'; ELSE zone_name := 'Zone B'; END IF;
      seat_label := CHR(64 + r) || c::TEXT;
      INSERT INTO seats (seat_number, row_num, col_num, zone, has_power)
      VALUES (seat_label, r, c, zone_name, (c % 3 = 0))
      ON CONFLICT (seat_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Default lockers (20 lockers)
DO $$
DECLARE i INT;
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO lockers (locker_number, monthly_fee)
    VALUES ('L' || LPAD(i::TEXT, 2, '0'), 200.00)
    ON CONFLICT (locker_number) DO NOTHING;
  END LOOP;
END $$;
