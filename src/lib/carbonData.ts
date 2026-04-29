// Sample data + simple localStorage-based "backend" for the Carbon Footprint Tracker.
// Beginner-friendly: no real server. Mirrors the SQL schema (USERS, ACTIVITY_TYPE, EMISSION_FACTOR, ACTIVITY).

export type Role = "User" | "Admin";

export interface User {
  user_id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
}

export interface ActivityType {
  activity_type_id: number;
  activity_name: string;
  unit: string;
  emission_per_unit: number; // kg CO2 per unit
}

export interface Activity {
  activity_id: number;
  user_id: number;
  activity_type_id: number;
  quantity: number;
  activity_date: string;
  total_emission: number;
}

export const ADMIN_EMAILS = ["admin1@example.com", "admin2@example.com"];

export const ACTIVITY_TYPES: ActivityType[] = [
  { activity_type_id: 1, activity_name: "Electricity Usage", unit: "kWh", emission_per_unit: 0.82 },
  { activity_type_id: 2, activity_name: "Fuel Consumption", unit: "liters", emission_per_unit: 2.31 },
  { activity_type_id: 3, activity_name: "Transportation", unit: "km", emission_per_unit: 0.45 },
  { activity_type_id: 4, activity_name: "Waste Generation", unit: "kg", emission_per_unit: 1.15 },
];

const SEED_USERS: User[] = [
  { user_id: 1, name: "Shriya Sidana", email: "shriya@email.com", password: "shriya123", role: "User", phone: "9876543210" },
  { user_id: 2, name: "Palak", email: "palak@email.com", password: "palak123", role: "User", phone: "9876543211" },
  { user_id: 3, name: "Yashita Aggarwal", email: "yashita@email.com", password: "yashita123", role: "User", phone: "9876543212" },
  { user_id: 4, name: "Admin One", email: "admin1@example.com", password: "admin123", role: "Admin" },
  { user_id: 5, name: "Admin Two", email: "admin2@example.com", password: "admin123", role: "Admin" },
];

const SEED_ACTIVITIES: Activity[] = [
  { activity_id: 1001, user_id: 1, activity_type_id: 1, quantity: 120, activity_date: "2026-04-10", total_emission: +(120 * 0.82).toFixed(2) },
  { activity_id: 1002, user_id: 1, activity_type_id: 3, quantity: 45, activity_date: "2026-04-15", total_emission: +(45 * 0.45).toFixed(2) },
  { activity_id: 1003, user_id: 2, activity_type_id: 2, quantity: 30, activity_date: "2026-04-12", total_emission: +(30 * 2.31).toFixed(2) },
  { activity_id: 1004, user_id: 3, activity_type_id: 4, quantity: 8, activity_date: "2026-04-20", total_emission: +(8 * 1.15).toFixed(2) },
  { activity_id: 1005, user_id: 1, activity_type_id: 2, quantity: 22, activity_date: "2026-04-25", total_emission: +(22 * 2.31).toFixed(2) },
];

const USERS_KEY = "cf_users";
const ACTS_KEY = "cf_activities";
const SESSION_KEY = "cf_session";

function init() {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  if (!localStorage.getItem(ACTS_KEY)) localStorage.setItem(ACTS_KEY, JSON.stringify(SEED_ACTIVITIES));
}
init();

export function getUsers(): User[] {
  init();
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function getActivities(): Activity[] {
  init();
  return JSON.parse(localStorage.getItem(ACTS_KEY) || "[]");
}

export function getActivityType(id: number) {
  return ACTIVITY_TYPES.find((a) => a.activity_type_id === id);
}

export function calculateEmission(quantity: number, activityTypeId: number): number {
  const t = getActivityType(activityTypeId);
  if (!t) return 0;
  return +(quantity * t.emission_per_unit).toFixed(2);
}

export function addActivity(userId: number, activityTypeId: number, quantity: number): Activity {
  const acts = getActivities();
  const newAct: Activity = {
    activity_id: Date.now(),
    user_id: userId,
    activity_type_id: activityTypeId,
    quantity,
    activity_date: new Date().toISOString().slice(0, 10),
    total_emission: calculateEmission(quantity, activityTypeId),
  };
  acts.push(newAct);
  localStorage.setItem(ACTS_KEY, JSON.stringify(acts));
  return newAct;
}

// --- "JWT" mock session ---
export interface Session {
  user_id: number;
  name: string;
  email: string;
  role: Role;
  token: string; // pseudo JWT
}

export function login(email: string, password: string): Session | null {
  const users = getUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
  if (!u) return null;
  // Enforce admin-email allowlist for Admin role
  const role: Role = ADMIN_EMAILS.includes(u.email) ? "Admin" : "User";
  const session: Session = {
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    role,
    token: btoa(`${u.user_id}:${u.email}:${Date.now()}`),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
