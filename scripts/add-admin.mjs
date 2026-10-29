// Makes the accounts in ADMIN_EMAIL admins (docs/DECISIONS.md D-054, D-055).
//
// Usage:
//   npm run admin:add      needs ADMIN_EMAIL, SUPABASE_URL and SUPABASE_SECRET_KEY,
//                          e.g. in .env.local (see .env.example)
//
// ADMIN_EMAIL is one email or a comma-separated list. Each person must have signed in to the
// site once, so their account exists. Admins are only added, never removed: to remove one,
// use the SQL in docs/DEPLOYMENT.md. The email never reaches the app; the database decides.
import { createClient } from '@supabase/supabase-js';

const PER_PAGE = 1000;

const emails = (process.env['ADMIN_EMAIL'] ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email !== '');

let exitCode = 0;
try {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_SECRET_KEY'];
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SECRET_KEY (see .env.example).');
  if (emails.length === 0) throw new Error('Set ADMIN_EMAIL in .env.local (see .env.example).');

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Every account, to match emails without depending on the auth schema.
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) throw new Error(`Couldn't list accounts: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < PER_PAGE) break;
  }
  const byEmail = new Map(users.map((user) => [(user.email ?? '').toLowerCase(), user]));

  const missing = emails.filter((email) => !byEmail.has(email));
  const rows = emails.flatMap((email) => {
    const user = byEmail.get(email);
    return user ? [{ user_id: user.id }] : [];
  });

  if (rows.length > 0) {
    const { error } = await supabase
      .from('admins')
      .upsert(rows, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) {
      throw new Error(
        `Couldn't add admins: ${error.message}. Has the admin migration been applied (npm run db:push)?`,
      );
    }
  }

  const { data: admins, error } = await supabase.from('admins').select('user_id');
  if (error) throw new Error(`Couldn't read admins: ${error.message}`);
  const emailById = new Map(users.map((user) => [user.id, user.email ?? '(no email)']));
  console.log(`\nAdmins now (${admins.length}):`);
  for (const { user_id } of admins) console.log(`  ${emailById.get(user_id) ?? user_id}`);

  if (missing.length > 0) {
    console.error(
      `\nNo account for: ${missing.join(', ')}. Sign in to the site once with that email, then run this again.`,
    );
    exitCode = 1;
  }
} catch (error) {
  console.error(`\n${error instanceof Error ? error.message : String(error)}`);
  exitCode = 1;
}
process.exit(exitCode);
