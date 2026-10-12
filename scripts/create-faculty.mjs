// Usage: node --env-file=.env.local scripts/create-faculty.mjs <email> <password> "<Full name>"
// Creates (or updates) a Supabase Auth user and lists it in faculty_users, which is what grants admin access.
import { createClient } from "@supabase/supabase-js";

const [email, password, name = ""] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error('Usage: create-faculty.mjs <email> <password (8+ chars)> "<Full name>"');
  process.exit(1);
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
let { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  if (!/already/i.test(error.message)) throw error;
  const list = await sb.auth.admin.listUsers({ perPage: 1000 });
  const user = list.data.users.find((u) => u.email === email.toLowerCase());
  ({ data, error } = await sb.auth.admin.updateUserById(user.id, { password, email_confirm: true }));
  if (error) throw error;
  data = { user };
}
const { error: e2 } = await sb
  .from("faculty_users")
  .upsert({ user_id: data.user.id, email: email.toLowerCase(), name });
if (e2) throw e2;
console.log("Faculty account ready:", email);
