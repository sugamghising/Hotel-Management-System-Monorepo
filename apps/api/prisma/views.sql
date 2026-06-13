/*
 * SQL Views for HMS
 * ============================================================================
 * Run AFTER `prisma migrate deploy`:
 *   psql "$DATABASE_URL" -f prisma/migrations/views.sql
 * Or: pnpm db:views
 * ============================================================================
 * These views are declared in Prisma schema but Prisma cannot create them
 * automatically — they must be created via raw SQL after each migration.
 * Views are safe to re-run (CREATE OR REPLACE).
 * ============================================================================
 */

-- ============================================================================
-- View 1: v_user_permissions
-- Purpose:  Auth middleware permission checking. Every API request that calls
--           requirePermission() queries this view or a Redis cache of it.
-- Schema:   VUserPermission model in Prisma
-- ============================================================================

CREATE OR REPLACE VIEW v_user_permissions AS
SELECT
  ur.user_id,
  ur.organization_id,
  ur.hotel_id,
  p.code        AS permission_code,
  p.category    AS permission_category,
  r.code        AS role_code,
  r.level       AS role_level
FROM user_roles ur
JOIN roles r
  ON r.id = ur.role_id
  AND r.deleted_at IS NULL
JOIN role_permissions rp
  ON rp.role_id = r.id
JOIN permissions p
  ON p.id = rp.permission_id
WHERE ur.expires_at IS NULL
   OR ur.expires_at > NOW();

-- Index for fast lookup on (user_id, organization_id, hotel_id)
-- Non-partial index because NOW() is not IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_v_user_perm_lookup
  ON user_roles (user_id, organization_id, hotel_id);

-- ============================================================================
-- View 2: v_in_house_guests
-- Purpose:  Front desk dashboard — current in-house guests with balance summary
-- Schema:   VInHouseGuest model in Prisma
-- ============================================================================

CREATE OR REPLACE VIEW v_in_house_guests AS
SELECT
  r.id                                     AS reservation_id,
  r.hotel_id,
  r.guest_id,
  g.first_name || ' ' || g.last_name       AS guest_name,
  rm.room_number,
  r.check_in_date,
  r.check_out_date,
  r.nights,
  r.balance,
  COALESCE(fi_sum.folio_total, 0)          AS folio_total,
  COALESCE(pay_sum.payment_total, 0)       AS payment_total,
  g.vip_status
FROM reservations r
JOIN guests g
  ON g.id = r.guest_id
LEFT JOIN reservation_rooms rr
  ON rr.reservation_id = r.id
  AND rr.status = 'OCCUPIED'
LEFT JOIN rooms rm
  ON rm.id = rr.room_id
LEFT JOIN (
  SELECT reservation_id,
         SUM(amount + tax_amount) AS folio_total
  FROM folio_items
  WHERE is_voided = FALSE
    AND item_type NOT IN ('PAYMENT', 'REFUND')
  GROUP BY reservation_id
) fi_sum ON fi_sum.reservation_id = r.id
LEFT JOIN (
  SELECT reservation_id,
         SUM(amount) AS payment_total
  FROM payments
  WHERE status IN ('CAPTURED', 'AUTHORIZED')
  GROUP BY reservation_id
) pay_sum ON pay_sum.reservation_id = r.id
WHERE r.status = 'CHECKED_IN'
  AND r.deleted_at IS NULL;

-- ============================================================================
-- View 3: v_room_availability
-- Purpose:  Availability calendar — used by booking engine and channel manager
-- Schema:   VRoomAvailability model in Prisma
-- ============================================================================

CREATE OR REPLACE VIEW v_room_availability AS
SELECT
  ri.room_type_id,
  rt.hotel_id,
  rt.code                           AS room_type_code,
  ri.date,
  ri.total_rooms,
  ri.available                      AS available_rooms,
  (ri.total_rooms - ri.available - ri.out_of_order)
                                    AS occupied_rooms,
  ri.out_of_order                   AS ooo_rooms,
  COALESCE(arr.arriving_today, 0)   AS arriving_today,
  COALESCE(dep.departing_today, 0)  AS departing_today
FROM room_inventory ri
JOIN room_types rt
  ON rt.id = ri.room_type_id
  AND rt.deleted_at IS NULL
LEFT JOIN (
  SELECT rr.room_type_id,
         r.check_in_date AS dt,
         COUNT(*) AS arriving_today
  FROM reservation_rooms rr
  JOIN reservations r ON r.id = rr.reservation_id
  WHERE r.status IN ('CONFIRMED', 'CHECKED_IN')
    AND r.deleted_at IS NULL
  GROUP BY rr.room_type_id, r.check_in_date
) arr ON arr.room_type_id = ri.room_type_id
      AND arr.dt = ri.date
LEFT JOIN (
  SELECT rr.room_type_id,
         r.check_out_date AS dt,
         COUNT(*) AS departing_today
  FROM reservation_rooms rr
  JOIN reservations r ON r.id = rr.reservation_id
  WHERE r.status = 'CHECKED_IN'
    AND r.deleted_at IS NULL
  GROUP BY rr.room_type_id, r.check_out_date
) dep ON dep.room_type_id = ri.room_type_id
      AND dep.dt = ri.date;

-- ============================================================================
-- View 4: v_daily_revenue
-- Purpose:  Night audit and financial reports
-- Schema:   VDailyRevenue model in Prisma
-- ============================================================================

CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT
  fi.hotel_id,
  fi.business_date,
  SUM(CASE WHEN fi.item_type = 'ROOM_CHARGE'
           THEN fi.amount ELSE 0 END)    AS room_revenue,
  SUM(CASE WHEN fi.item_type = 'POS_CHARGE'
           THEN fi.amount ELSE 0 END)    AS fnb_revenue,
  SUM(CASE WHEN fi.item_type NOT IN
               ('ROOM_CHARGE','POS_CHARGE','TAX',
                'PAYMENT','REFUND','ADJUSTMENT','DISCOUNT')
           THEN fi.amount ELSE 0 END)    AS other_revenue,
  SUM(fi.tax_amount)                     AS tax_total,
  SUM(CASE WHEN fi.item_type NOT IN ('PAYMENT','REFUND')
           THEN fi.amount + fi.tax_amount
           ELSE 0 END)                   AS total_revenue,
  SUM(CASE WHEN fi.item_type = 'PAYMENT'
           THEN fi.amount ELSE 0 END)    AS payment_total
FROM folio_items fi
WHERE fi.is_voided = FALSE
GROUP BY fi.hotel_id, fi.business_date;
