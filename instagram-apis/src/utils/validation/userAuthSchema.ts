// libs
import { z } from "zod";

import { MESSAGES_VALIDATION, REGEX } from "@/constants";

export const loginSchema = z.object({
	email: z.string().email({ message: MESSAGES_VALIDATION.INVALID_EMAIL }),
	password: z
		.string()
		.regex(REGEX.PASSWORD, {
			message: MESSAGES_VALIDATION.PASSWORD_INVALID
		})
});

export const registerSchema = z.object({
	email: z.string().email({ message: MESSAGES_VALIDATION.INVALID_EMAIL }),
	password: z
		.string()
		.regex(REGEX.PASSWORD, {
			message: MESSAGES_VALIDATION.PASSWORD_INVALID
		}),
	username: z.string().min(1, { message: "Username is required" })
});