import { z } from "zod";

export const NameSchema = z.string().min(2).max(50);
export const PhoneSchema = z.string().min(10).max(10);