import { z } from "zod";
import {
  CREATIVE_STATUSES,
  CSR_STATUSES,
  MARKETING_STATUSES,
  PAYOUT_STATUSES,
  PLATFORMS,
  ROLES,
} from "@/lib/constants";

const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(64, "Username is too long.");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

const optionalText = z.string().trim().max(4000).optional().default("");

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  username,
  birthday: z.string().trim().min(1, "Birthday is required."),
  password,
  role: z.enum(ROLES),
});

export const resetPasswordSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required."),
    birthday: z.string().trim().min(1, "Birthday is required."),
    password,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    password,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export const taskSchema = z.object({
  task: z.string().trim().min(1, "Task name is required.").max(500),
  deadline: z.string().trim().optional().default(""),
  live: z.string().trim().optional().default(""),
  note: optionalText,
  assigned: z.string().trim().optional().default(""),
});

export const taskUpdateSchema = taskSchema.partial();

export const archiveActionSchema = z.object({
  status: z.enum(["Done", "Deleted"]),
});

const calendarEventSchema = z.object({
  host: z.string().trim().max(160).optional(),
  topic: z.string().trim().max(300).optional(),
  time: z.string().trim().max(40).optional(),
  platform: z.string().trim().max(60).optional(),
  employee: z.string().trim().max(160).optional(),
  reason: z.string().trim().max(500).optional(),
  id: z.string().trim().max(80).optional(),
});

export const calendarEventMutationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/, "Invalid calendar date."),
  event: calendarEventSchema,
  index: z.coerce.number().int().min(0).optional(),
});

export const calendarDeleteSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/, "Invalid calendar date."),
  index: z.coerce.number().int().min(0),
});

export const creativeSchema = z.object({
  campaign: z.string().trim().min(1, "Campaign name is required.").max(300),
  platform: z.enum(PLATFORMS),
  status: z.enum(CREATIVE_STATUSES).default("Pending"),
  link: z.string().trim().max(500).optional().default(""),
});

export const creativeUpdateSchema = z.object({
  status: z.enum(CREATIVE_STATUSES),
});

export const payoutSchema = z.object({
  name: z.string().trim().min(1, "Influencer name is required.").max(200),
  campaign: z.string().trim().min(1, "Campaign is required.").max(300),
  date: z.string().trim().optional().default(""),
  status: z.enum(PAYOUT_STATUSES).default("Ongoing Creation"),
  link: z.string().trim().max(500).optional().default(""),
});

export const payoutUpdateSchema = z.object({
  status: z.enum(PAYOUT_STATUSES),
});

export const csrSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required.").max(200),
  concern: z.string().trim().min(1, "Concern is required.").max(500),
  date: z.string().trim().optional().default(""),
  status: z.enum(CSR_STATUSES).default("Open"),
  chatlink: z.string().trim().max(500).optional().default(""),
});

export const csrUpdateSchema = z.object({
  status: z.enum(CSR_STATUSES),
});

export const campaignSchema = z.object({
  campaign: z.string().trim().min(1, "Campaign name is required.").max(300),
  date: z.string().trim().optional().default(""),
  budget: z.coerce
    .number()
    .min(0, "Budget cannot be negative.")
    .max(1_000_000_000, "Budget is too large.")
    .default(0),
  link: z.string().trim().max(500).optional().default(""),
  notes: optionalText,
});

export const marketingContentSchema = z.object({
  id: z.string().trim().max(120).optional().default(""),
  schedule: z.string().trim().optional().default(""),
  account: z.string().trim().max(120).optional().default(""),
  platform: z.string().trim().max(120).optional().default(""),
  event: z.string().trim().max(300).optional().default(""),
  visual: z.string().trim().max(1000).optional().default(""),
  header: z.string().trim().max(500).optional().default(""),
  subheader: z.string().trim().max(500).optional().default(""),
  caption: z.string().trim().max(5000).optional().default(""),
  hashtags: z.string().trim().max(1000).optional().default(""),
  creatives: z.string().trim().max(1000).optional().default(""),
  campaign: z.string().trim().max(300).optional().default(""),
  notes: z.string().trim().max(5000).optional().default(""),
  status: z.enum(MARKETING_STATUSES).default("Pending"),
  archive: z.string().trim().max(200).optional().default(""),
  file: z.string().max(6_000_000).optional().default(""),
});

export const marketingContentUpdateSchema = marketingContentSchema.partial();

export const archiveNameSchema = z.object({
  name: z.string().trim().min(1, "Archive name is required.").max(200),
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(ROLES).optional(),
  birthday: z.string().trim().optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
export type CreativeInput = z.infer<typeof creativeSchema>;
export type PayoutInput = z.infer<typeof payoutSchema>;
export type CsrInput = z.infer<typeof csrSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type MarketingContentInput = z.infer<typeof marketingContentSchema>;
