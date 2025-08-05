// libs
import { z } from "zod";

import { MESSAGES_VALIDATION, REGEX } from "@/constants";

export const userSchema = z.object({
  userId: z.number().int().positive({
    message: MESSAGES_VALIDATION.INVALID_ID
  })
});

export const userUpdateSchema = z.object({
  email: z.string().email({ message: MESSAGES_VALIDATION.INVALID_EMAIL }),
  username: z
    .string()
    .regex(REGEX.NAME, {
      message: `Username is required`
    })
});

export const usersUpdateSchema = z.array(userUpdateSchema);
