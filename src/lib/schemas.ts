import { z } from "zod";

export const AppItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  appName: z.string().min(1, "App name is required"),
  packageName: z.string().min(1, "Package name is required"),
  playStoreUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  iconUrl: z.string().min(1, "Icon URL is required"),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  featured: z.boolean().default(false),
  year: z.string().default(new Date().getFullYear().toString()),
  client: z.string().default("Samyukt Proprietary"),
  stack: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
});

export type AppItem = z.infer<typeof AppItemSchema>;

export const WebsiteItemSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Website name is required"),
  slug: z.string().min(1, "Slug is required"),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  iconUrl: z.string().min(1, "Icon URL is required"),
  status: z.string().min(1, "Status is required"),
  category: z.string().min(1, "Category is required"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  featured: z.boolean().default(false),
  year: z.string().default(new Date().getFullYear().toString()),
  client: z.string().default("Samyukt Proprietary"),
  stack: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
});

export type WebsiteItem = z.infer<typeof WebsiteItemSchema>;

export const RegistrySchema = z.object({
  version: z.string().default("2.0.0"),
  updatedAt: z.string().default(new Date().toISOString().split("T")[0]),
  statusOptions: z.array(z.string()).default([
    "production",
    "published",
    "in_progress",
    "closed_testing",
    "coming_soon",
    "draft",
  ]),
  apps: z.array(AppItemSchema).default([]),
  websites: z.array(WebsiteItemSchema).default([]),
});

export type RegistryData = z.infer<typeof RegistrySchema>;
