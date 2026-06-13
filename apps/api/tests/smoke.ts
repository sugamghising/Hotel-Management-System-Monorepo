import { SmokeTestRunner, expect, authGet, authPost, authPatch, authDelete, post, log, setToken } from './helpers';

const BASE_URL = process.env.API_URL ?? 'http://localhost:3001';
const API = `${BASE_URL}/api/v1`;

const runner = new SmokeTestRunner();

interface Context {
  accessToken: string;
  refreshToken: string;
  organizationId: string;
  hotelId: string;
  roomTypeId: string;
  roomId: string;
  ratePlanId: string;
  guestId: string;
  reservationId: string;
  folioItemId: string;
  paymentId: string;
  invoiceId: string;
  hkTaskId: string;
  maintenanceId: string;
  inventoryItemId: string;
  vendorId: string;
  poId: string;
  posOrderId: string;
  channelId: string;
  communicationId: string;
  templateId: string;
}

const ctx: Partial<Context> = {};

function org(path: string) {
  return `${API}/organizations/${ctx.organizationId}${path}`;
}

function hotel(path: string) {
  return `${API}/organizations/${ctx.organizationId}/hotels/${ctx.hotelId}${path}`;
}

// ────────────────────────────────────────────────────
// STEP 0 — Health check
// ────────────────────────────────────────────────────

runner.step('SYSTEM: Health check', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.status).toBe('ok');
});

// ────────────────────────────────────────────────────
// STEP 1 — Authentication: Login
// ────────────────────────────────────────────────────

runner.step('AUTH: Login as org admin', async () => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@demo.com',
      password: 'Admin@123456',
      organizationCode: 'DEMO',
    }),
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.data.tokens.accessToken).toBeTruthy();
  expect(body.data.tokens.refreshToken).toBeTruthy();
  setToken(body.data.tokens.accessToken);
  ctx.accessToken = body.data.tokens.accessToken;
  ctx.refreshToken = body.data.tokens.refreshToken;
  ctx.organizationId = body.data.user.organizationId;
  log(`  \u2192 Logged in. Org: ${ctx.organizationId}`);
});

// ────────────────────────────────────────────────────
// STEP 2 — Authentication: /me + token refresh
// ────────────────────────────────────────────────────

runner.step('AUTH: GET /me', async () => {
  const res = await authGet(`${API}/auth/me`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.user.email).toBe('admin@demo.com');
});

runner.step('AUTH: Refresh token', async () => {
  const res = await post(`${API}/auth/refresh`, {
    refreshToken: ctx.refreshToken,
  });
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.tokens.accessToken).toBeTruthy();
  setToken(body.data.tokens.accessToken);
  ctx.accessToken = body.data.tokens.accessToken;
  ctx.refreshToken = body.data.tokens.refreshToken;
  log('  \u2192 Tokens refreshed');
});

// ────────────────────────────────────────────────────
// STEP 3 — Organizations
// ────────────────────────────────────────────────────

runner.step('ORGS: GET organization detail', async () => {
  const res = await authGet(`${API}/organizations/${ctx.organizationId}`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.organization.code).toBe('DEMO');
  log(`  \u2192 Org: ${body.data.organization.name}`);
});

runner.step('ORGS: GET organization limits', async () => {
  const res = await authGet(`${API}/organizations/${ctx.organizationId}/limits`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.limits.hotels).toBeDefined();
  log(`  \u2192 Hotels used: ${body.data.limits.hotels.used}/${body.data.limits.hotels.max}`);
});

// ────────────────────────────────────────────────────
// STEP 4 — Hotels
// ────────────────────────────────────────────────────

runner.step('HOTELS: List hotels', async () => {
  const res = await authGet(`${API}/organizations/${ctx.organizationId}/hotels`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.hotels.length).toBeGreaterThan(0);
  ctx.hotelId = body.data.hotels[0].id;
  log(`  \u2192 Hotel: ${body.data.hotels[0].name} (${ctx.hotelId})`);
});

runner.step('HOTELS: GET hotel detail with stats', async () => {
  const res = await authGet(hotel('') + `?stats=true`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.hotel.capacity).toBeDefined();
  log(`  \u2192 Total rooms: ${body.data.hotel.capacity.totalRooms}`);
});

runner.step('HOTELS: GET hotel dashboard', async () => {
  const res = await authGet(hotel('/dashboard'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.dashboard.today).toBeDefined();
  log(`  \u2192 In-house: ${body.data.dashboard.today.inHouse}`);
});

// ────────────────────────────────────────────────────
// STEP 5 — Users & RBAC
// ────────────────────────────────────────────────────

runner.step('USERS: List users', async () => {
  const res = await authGet(`${API}/users`);
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.users.length).toBeGreaterThan(0);
  log(`  \u2192 Users: ${body.data.users.length}`);
});

runner.step('RBAC: List roles', async () => {
  const res = await authGet(org('/roles'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.roles.length).toBeGreaterThan(0);
  log(`  \u2192 Roles: ${body.data.roles.length}`);
});

runner.step('RBAC: List permissions', async () => {
  const res = await authGet(org('/permissions'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.permissions.length).toBeGreaterThan(70);
  log(`  \u2192 Permissions: ${body.data.permissions.length}`);
});

// ────────────────────────────────────────────────────
// STEP 6 — Room Types
// ────────────────────────────────────────────────────

runner.step('ROOM_TYPES: List room types', async () => {
  const res = await authGet(hotel('/room-types'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.roomTypes.length).toBeGreaterThan(0);
  ctx.roomTypeId = body.data.roomTypes[0].id;
  log(`  \u2192 Room types: ${body.data.roomTypes.length}, using: ${body.data.roomTypes[0].code}`);
});

runner.step('ROOM_TYPES: GET room type detail', async () => {
  const res = await authGet(hotel(`/room-types/${ctx.roomTypeId}?stats=true`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.roomType.capacity).toBeDefined();
});

runner.step('ROOM_TYPES: GET inventory calendar', async () => {
  const today = new Date().toISOString().split('T')[0];
  const plus30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const res = await authGet(hotel(`/room-types/${ctx.roomTypeId}/inventory?startDate=${today}&endDate=${plus30}`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.calendar.dates.length).toBeGreaterThan(0);
  log(`  \u2192 Inventory days: ${body.data.calendar.dates.length}`);
});

// ────────────────────────────────────────────────────
// STEP 7 — Rooms
// ────────────────────────────────────────────────────

runner.step('ROOMS: List rooms', async () => {
  const res = await authGet(hotel('/rooms'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.rooms.length).toBeGreaterThan(0);
  const vacant = body.data.rooms.find((r: any) => r.status === 'VACANT_CLEAN');
  ctx.roomId = vacant?.id ?? body.data.rooms[0].id;
  log(`  \u2192 Rooms: ${body.data.rooms.length}, using: ${vacant?.roomNumber ?? body.data.rooms[0].roomNumber}`);
});

runner.step('ROOMS: GET room grid', async () => {
  const res = await authGet(hotel('/rooms/grid'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.grid.floors).toBeDefined();
  log(`  \u2192 Floors: ${body.data.grid.floors.length}`);
});

// ────────────────────────────────────────────────────
// STEP 8 — Rate Plans
// ────────────────────────────────────────────────────

runner.step('RATE_PLANS: List rate plans', async () => {
  const res = await authGet(hotel('/rate-plans'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.ratePlans.length).toBeGreaterThan(0);
  ctx.ratePlanId = body.data.ratePlans[0].id;
  log(`  \u2192 Rate plans: ${body.data.ratePlans.length}`);
});

runner.step('RATE_PLANS: Calculate rates', async () => {
  const checkIn = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const checkOut = new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0];
  const res = await authPost(hotel('/rate-plans/calculate'), {
    roomTypeId: ctx.roomTypeId,
    checkIn,
    checkOut,
    adults: 2,
    children: 0,
  });
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.availableRatePlans.length).toBeGreaterThan(0);
  log(`  \u2192 Rate plans available: ${body.data.availableRatePlans.length}, BAR: $${body.data.bestAvailableRate}`);
});

// ────────────────────────────────────────────────────
// STEP 9 — Guests (CRM)
// ────────────────────────────────────────────────────

runner.step('GUESTS: Search guests', async () => {
  const res = await authGet(org('/guests?search=Carter'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.guests.length).toBeGreaterThan(0);
  ctx.guestId = body.data.guests[0].id;
  log(`  \u2192 Found guest: ${body.data.guests[0].firstName} ${body.data.guests[0].lastName}`);
});

runner.step('GUESTS: GET guest detail', async () => {
  const res = await authGet(org(`/guests/${ctx.guestId}`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.guest.vipStatus).toBeDefined();
});

runner.step('GUESTS: Create new guest', async () => {
  const res = await authPost(org('/guests'), {
    firstName: 'Smoke',
    lastName: 'Test',
    email: `smoketest+${Date.now()}@test.com`,
    phone: '+1-555-9999',
    languageCode: 'en',
    guestType: 'TRANSIENT',
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  expect(body.data.guest.id).toBeTruthy();
  log(`  \u2192 Created guest: ${body.data.guest.id}`);
});

// ────────────────────────────────────────────────────
// STEP 10 — Reservations
// ────────────────────────────────────────────────────

runner.step('RES: List reservations', async () => {
  const res = await authGet(hotel('/reservations'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.reservations.length).toBeGreaterThan(0);
  log(`  \u2192 Reservations: ${body.data.reservations.length}`);
});

runner.step('RES: Today arrivals', async () => {
  const res = await authGet(hotel('/reservations/today/arrivals'));
  expect(res.status).toBe(200);
});

runner.step('RES: In-house guests', async () => {
  const res = await authGet(hotel('/reservations/in-house'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(Array.isArray(body.data.guests)).toBe(true);
  log(`  \u2192 In-house: ${body.data.guests.length}`);
});

runner.step('RES: Create reservation', async () => {
  const checkIn = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
  const checkOut = new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0];
  const res = await authPost(hotel('/reservations'), {
    guestId: ctx.guestId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adultCount: 2,
    childCount: 0,
    roomTypeId: ctx.roomTypeId,
    ratePlanId: ctx.ratePlanId,
    source: 'DIRECT_WEB',
    guaranteeType: 'CREDIT_CARD',
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  ctx.reservationId = body.data.reservation.id;
  log(`  \u2192 Reservation: ${body.data.reservation.confirmationNumber}`);
});

runner.step('RES: Assign room', async () => {
  const res = await authPost(hotel(`/reservations/${ctx.reservationId}/assign-room`), {
    roomId: ctx.roomId,
  });
  expect(res.status).toBe(200);
  log('  \u2192 Room assigned');
});

// ────────────────────────────────────────────────────
// STEP 11 — Folio & Billing
// ────────────────────────────────────────────────────

runner.step('FOLIO: Setup — find checked-in reservation', async () => {
  const res = await authGet(hotel('/reservations?status=CHECKED_IN'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.reservations.length).toBeGreaterThan(0);
  ctx.reservationId = body.data.reservations[0].id;
  log(`  \u2192 Using reservation: ${body.data.reservations[0].confirmationNumber}`);
});

runner.step('FOLIO: GET folio', async () => {
  const res = await authGet(hotel(`/reservations/${ctx.reservationId}/folio`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.folio.summary).toBeDefined();
  log(`  \u2192 Balance: $${body.data.folio.summary.balance}`);
});

runner.step('FOLIO: Post a charge', async () => {
  const res = await authPost(hotel(`/reservations/${ctx.reservationId}/folio/charges`), {
    itemType: 'MINIBAR',
    description: 'Smoke test minibar charge',
    amount: 15.00,
    quantity: 1,
    unitPrice: 15.00,
    taxAmount: 1.50,
    department: 'ROOMS',
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  ctx.folioItemId = body.data.item?.id;
  log('  \u2192 Charge posted: $15.00');
});

runner.step('FOLIO: Void the charge', async () => {
  if (!ctx.folioItemId) { log('  \u2192 Skipped (no item ID)'); return; }
  const res = await authPost(hotel(`/reservations/${ctx.reservationId}/folio/charges/${ctx.folioItemId}/void`), {
    reason: 'Smoke test void',
  });
  expect(res.status).toBe(200);
  log('  \u2192 Charge voided');
});

runner.step('FOLIO: List payments', async () => {
  const res = await authGet(hotel(`/reservations/${ctx.reservationId}/folio/payments`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Payments: ${body.data.payments.length}`);
});

runner.step('FOLIO: Create invoice', async () => {
  const res = await authPost(hotel(`/reservations/${ctx.reservationId}/folio/invoices`), {
    billToName: 'Smoke Test Guest',
    billToAddress: { country: 'US' },
  });
  expect([200, 201]).toContain(res.status);
  const body = await res.json() as any;
  ctx.invoiceId = body.data.invoice?.id;
  log(`  \u2192 Invoice: ${body.data.invoice?.invoiceNumber ?? 'existing'}`);
});

// ────────────────────────────────────────────────────
// STEP 12 — Housekeeping
// ────────────────────────────────────────────────────

runner.step('HK: GET dashboard', async () => {
  const res = await authGet(hotel('/housekeeping/dashboard'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.dashboard).toBeDefined();
  log(`  \u2192 HK tasks pending: ${body.data.dashboard.pending ?? 0}`);
});

runner.step('HK: List tasks', async () => {
  const res = await authGet(hotel('/housekeeping/tasks'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 HK tasks: ${body.data.tasks.length}`);
  if (body.data.tasks.length > 0) {
    ctx.hkTaskId = body.data.tasks[0].id;
  }
});

runner.step('HK: Create task', async () => {
  const today = new Date().toISOString().split('T')[0];
  const roomsRes = await authGet(hotel('/rooms?pageSize=1'));
  const rooms = await roomsRes.json() as any;
  const roomId = rooms.data.rooms[0].id;

  const res = await authPost(hotel('/housekeeping/tasks'), {
    roomId,
    taskType: 'CLEANING_TOUCHUP',
    priority: 0,
    scheduledFor: today,
    estimatedMinutes: 20,
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  ctx.hkTaskId = body.data.task.id;
  log(`  \u2192 HK task created: ${ctx.hkTaskId}`);
});

runner.step('HK: Start task', async () => {
  if (!ctx.hkTaskId) { log('  \u2192 Skipped (no task ID)'); return; }
  const res = await authPost(hotel(`/housekeeping/tasks/${ctx.hkTaskId}/start`), {});
  expect(res.status).toBe(200);
  log('  \u2192 Task started');
});

runner.step('HK: Complete task', async () => {
  if (!ctx.hkTaskId) { log('  \u2192 Skipped (no task ID)'); return; }
  const res = await authPost(hotel(`/housekeeping/tasks/${ctx.hkTaskId}/complete`), {
    inspectionScore: 95,
  });
  expect(res.status).toBe(200);
  log('  \u2192 Task completed');
});

// ────────────────────────────────────────────────────
// STEP 13 — Maintenance
// ────────────────────────────────────────────────────

runner.step('MAINT: List requests', async () => {
  const res = await authGet(hotel('/maintenance/requests'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Maintenance requests: ${body.data.requests.length}`);
});

runner.step('MAINT: Create request', async () => {
  const res = await authPost(hotel('/maintenance/requests'), {
    category: 'IT_EQUIPMENT',
    priority: 'LOW',
    title: 'Smoke test — TV remote not working',
    description: 'Automated smoke test maintenance request.',
    reportedByType: 'STAFF',
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  ctx.maintenanceId = body.data.request.id;
  log(`  \u2192 Maintenance request: ${ctx.maintenanceId}`);
});

runner.step('MAINT: GET dashboard', async () => {
  const res = await authGet(hotel('/maintenance/dashboard'));
  expect(res.status).toBe(200);
});

// ────────────────────────────────────────────────────
// STEP 14 — Inventory & Procurement
// ────────────────────────────────────────────────────

runner.step('INV: List items', async () => {
  const res = await authGet(hotel('/inventory/items'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.items.length).toBeGreaterThan(0);
  ctx.inventoryItemId = body.data.items[0].id;
  log(`  \u2192 Inventory items: ${body.data.items.length}`);
});

runner.step('INV: Adjust stock', async () => {
  if (!ctx.inventoryItemId) { log('  \u2192 Skipped (no item ID)'); return; }
  const res = await authPost(hotel(`/inventory/items/${ctx.inventoryItemId}/adjust`), {
    quantity: 5,
    reason: 'Smoke test adjustment',
    notes: 'Automated test',
  });
  expect(res.status).toBe(200);
  log('  \u2192 Stock adjusted +5');
});

runner.step('INV: List vendors', async () => {
  const res = await authGet(hotel('/inventory/vendors'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  if (body.data.vendors.length > 0) {
    ctx.vendorId = body.data.vendors[0].id;
  }
  log(`  \u2192 Vendors: ${body.data.vendors.length}`);
});

runner.step('INV: List purchase orders', async () => {
  const res = await authGet(hotel('/inventory/purchase-orders'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 POs: ${body.data.orders.length}`);
});

// ────────────────────────────────────────────────────
// STEP 15 — Night Audit
// ────────────────────────────────────────────────────

runner.step('AUDIT: Pre-check', async () => {
  const res = await authGet(hotel('/night-audit/pre-check'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Pre-check: unbalanced=${body.data.preCheck.unbalancedFolios}, discrepancies=${body.data.preCheck.roomDiscrepancies}`);
});

runner.step('AUDIT: Check status / history', async () => {
  const res = await authGet(hotel('/night-audit/history'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Audit history: ${body.data.history.length} records`);
});

// ────────────────────────────────────────────────────
// STEP 16 — POS / Restaurant
// ────────────────────────────────────────────────────

runner.step('POS: List outlets', async () => {
  const res = await authGet(hotel('/pos/outlets'));
  expect(res.status).toBe(200);
});

runner.step('POS: List orders', async () => {
  const res = await authGet(hotel('/pos/orders'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 POS orders: ${body.data.orders.length}`);
});

runner.step('POS: Create order', async () => {
  const res = await authPost(hotel('/pos/orders'), {
    outlet: 'Main Restaurant',
    tableNumber: 'T5',
  });
  expect(res.status).toBe(201);
  const body = await res.json() as any;
  ctx.posOrderId = body.data.order.id;
  log(`  \u2192 POS order: ${body.data.order.orderNumber}`);
});

runner.step('POS: Add item to order', async () => {
  if (!ctx.posOrderId) { log('  \u2192 Skipped (no order ID)'); return; }
  const res = await authPost(hotel(`/pos/orders/${ctx.posOrderId}/items`), {
    itemName: 'Club Sandwich',
    itemCode: 'SNDW-001',
    quantity: 2,
    unitPrice: 18.00,
  });
  expect(res.status).toBe(200);
  log('  \u2192 Item added: 2\u00d7 Club Sandwich');
});

runner.step('POS: Void order (cleanup)', async () => {
  if (!ctx.posOrderId) { log('  \u2192 Skipped (no order ID)'); return; }
  const res = await authPost(hotel(`/pos/orders/${ctx.posOrderId}/void`), {
    reason: 'Smoke test cleanup',
  });
  expect(res.status).toBe(200);
  log('  \u2192 Order voided');
});

// ────────────────────────────────────────────────────
// STEP 17 — Channel Manager
// ────────────────────────────────────────────────────

runner.step('CHANNELS: List connections', async () => {
  const res = await authGet(hotel('/channels/connections'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Connected channels: ${body.data.channels?.length ?? 0}`);
});

// ────────────────────────────────────────────────────
// STEP 18 — Communications
// ────────────────────────────────────────────────────

runner.step('COMMS: List templates', async () => {
  const res = await authGet(org('/communications/templates'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.templates.length).toBeGreaterThan(0);
  ctx.templateId = body.data.templates[0].id;
  log(`  \u2192 Templates: ${body.data.templates.length}`);
});

runner.step('COMMS: List communication log', async () => {
  const res = await authGet(org('/communications'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Communications logged: ${body.data.communications.length}`);
});

runner.step('COMMS: Send a communication', async () => {
  const res = await authPost(org('/communications/send'), {
    guestId: ctx.guestId,
    channel: 'EMAIL',
    type: 'CUSTOM',
    subject: 'Smoke test message',
    content: 'This is an automated smoke test message.',
  });
  expect([200, 201, 202]).toContain(res.status);
  log('  \u2192 Message sent/queued');
});

// ────────────────────────────────────────────────────
// STEP 19 — Reports
// ────────────────────────────────────────────────────

runner.step('REPORTS: Occupancy report', async () => {
  const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];
  const res = await authGet(hotel(`/reports/occupancy?dateFrom=${from}&dateTo=${to}`));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  log(`  \u2192 Occupancy data: ${body.data.occupancy?.length ?? body.data.length ?? '?'} records`);
});

runner.step('REPORTS: Revenue report', async () => {
  const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];
  const res = await authGet(hotel(`/reports/revenue?dateFrom=${from}&dateTo=${to}`));
  expect(res.status).toBe(200);
  log('  \u2192 Revenue report OK');
});

runner.step('REPORTS: ADR report', async () => {
  const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];
  const res = await authGet(hotel(`/reports/adr?dateFrom=${from}&dateTo=${to}`));
  expect(res.status).toBe(200);
  log('  \u2192 ADR report OK');
});

// ────────────────────────────────────────────────────
// STEP 20 — Guest Stats
// ────────────────────────────────────────────────────

runner.step('GUESTS: GET guest statistics', async () => {
  const res = await authGet(org('/guests/stats'));
  expect(res.status).toBe(200);
  const body = await res.json() as any;
  expect(body.data.stats).toBeDefined();
  log(`  \u2192 Total guests: ${body.data.stats.totalGuests}`);
});

// Run all tests
runner.run();
