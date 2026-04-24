import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';

type Bindings = { DB: D1Database };
type Variables = { jwtPayload: { id: string; role: string } };

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();
const SECRET_KEY = "UTTAMSEWA_SUPER_SECRET_2026";

// Middleware
app.use('*', cors());

// Health
app.get('/', (c) => c.text('API Running 🚀'));

// ================= AUTH =================

// Register
app.post('/api/auth/register', async (c) => {
  const { name, email, password, role } = await c.req.json();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(id, name, email, password, role).run();

    return c.json({ success: true }, 201);
  } catch {
    return c.json({ error: "Email already exists" }, 400);
  }
});

// Login
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE email = ? AND password = ?"
  ).bind(email, password).first<any>();

  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const token = await sign(
    { id: user.id, role: user.role },
    SECRET_KEY,
    'HS256'
  );

  return c.json({ token, user });
});

// ================= PROTECTED =================
app.use('/api/*', jwt({
  secret: SECRET_KEY,
  alg: 'HS256'
}));
// ================= PROFILE =================

// GET PROFILE
app.get('/api/profiles', async (c) => {
  const payload = c.get('jwtPayload');

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(payload.id).first();

  return c.json(user);
});
app.get('/api/vendors', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, company_name FROM users WHERE role = 'vendor'"
  ).all();

  return c.json(results);
});

// UPDATE PROFILE
app.post('/api/profiles', async (c) => {
  const payload = c.get('jwtPayload');
  const body = await c.req.json();

  const company_name = body.company_name ?? null;
  const gstin = body.gstin ?? null;
  const competencies = body.competencies ?? null;
  const service_rate = body.service_rate ?? null;

  try {
    await c.env.DB.prepare(
      `UPDATE users SET 
        company_name = ?, 
        gstin = ?, 
        competencies = ?, 
        service_rate = ? 
       WHERE id = ?`
    ).bind(
      company_name,
      gstin,
      competencies,
      service_rate,
      payload.id
    ).run();

    return c.json({ success: true });

  } catch (err: any) {
    console.error(err);
    return c.json({ error: err.message }, 500);
  }
});

// ================= CONTRACTS =================

// CREATE
app.post('/api/contracts', async (c) => {
  const payload = c.get('jwtPayload');
  const { provider_id, title, amount } = await c.req.json();

  await c.env.DB.prepare(
    "INSERT INTO contracts (title, amount, client_id, provider_id) VALUES (?, ?, ?, ?)"
  ).bind(title, amount, payload.id, provider_id).run();

  return c.json({ success: true });
});

// CLIENT CONTRACTS
app.get('/api/contracts/client', async (c) => {
  const payload = c.get('jwtPayload');

  const { results } = await c.env.DB.prepare(
    `SELECT c.*, u.name as provider_name 
     FROM contracts c 
     LEFT JOIN users u ON c.provider_id = u.id 
     WHERE c.client_id = ?`
  ).bind(payload.id).all();

  return c.json(results);
});

// VENDOR CONTRACTS
app.get('/api/contracts/vendor', async (c) => {
  const payload = c.get('jwtPayload');

  const { results } = await c.env.DB.prepare(
    `SELECT c.*, u.name as client_name 
     FROM contracts c 
     JOIN users u ON c.client_id = u.id 
     WHERE c.provider_id = ?`
  ).bind(payload.id).all();

  return c.json(results);
});

export default app;