import { Request } from "express";
import { ZodSchema } from "zod";

export const validateRequestBody = (schema: ZodSchema, req: Request) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    let customErrors: Record<string, string> = {};

    for (const key in formattedErrors) {
      const errorFormattedItem = formattedErrors[key];
      if (errorFormattedItem?.length) {
        customErrors[key] = errorFormattedItem[0];
      }
    }
    
    return customErrors;
  }

  return null;
};