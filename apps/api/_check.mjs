import { readFileSync } from 'fs';
import { Pool } from 'pg';

const envText = readFileSync('.env', 'utf-8');
for (const line of envText.split('\n')) {
  const m = line.match(/^(\w+)=(.+)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const userRoles = await pool.query(
    "SELECT ur.user_id, r.code FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1::uuid",
    ['acf81e92-6853-45af-a95e-f532c4aad5e2']
  );
  console.log('User roles:', JSON.stringify(userRoles.rows));
  
  const permCount = await pool.query('SELECT COUNT(*)::int as cnt FROM permissions');
  console.log('Total permissions:', permCount.rows[0].cnt);
  
  const rolePermCount = await pool.query('SELECT COUNT(*)::int as cnt FROM role_permissions');
  console.log('Role-permission assignments:', rolePermCount.rows[0].cnt);
} catch (e) {
  console.error(e);
} finally {
  await pool.end();
}
