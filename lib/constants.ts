export const ROLES = [
  "Head of Ecommerce Manager",
  "Ecommerce Supervisor",
  "TikTok Operator",
  "Sales Channel Operators",
  "Shopee Operator",
  "Lazada Operator",
  "Digital Marketing",
  "Graphic Artists",
  "Customer Service",
  "Live Hosts",
] as const;

export type Role = (typeof ROLES)[number];

export const MANAGER_ROLES: readonly string[] = [
  "Head of Ecommerce Manager",
  "Ecommerce Supervisor",
];

export function isManager(role?: string | null): boolean {
  return !!role && MANAGER_ROLES.includes(role);
}

export const PLATFORMS = ["Shopee", "TikTok", "Lazada"] as const;
export const MARKETING_ACCOUNTS = ["TCL", "iFFalcon"] as const;

export const CREATIVE_STATUSES = [
  "Pending",
  "In-Design",
  "For-Approval",
  "Done",
] as const;

export const PAYOUT_STATUSES = [
  "Ongoing Creation",
  "Waiting for Finance",
  "SO Creation",
  "For Approval",
  "Waiting for SI",
  "SI Delivered",
  "Done",
] as const;

export const CSR_STATUSES = ["Open", "In Progress", "Resolved"] as const;

export const MARKETING_STATUSES = [
  "Pending",
  "In Review",
  "Scheduled",
  "Posted",
] as const;

export const CSR_CONCERNS = [
  "Warranty",
  "Repair",
  "Installation",
  "Follow-up",
  "Others",
] as const;

export const SESSION_COOKIE = "tcl_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
