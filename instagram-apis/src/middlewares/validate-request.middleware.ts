import { STATUS_CODE } from "@/constants";
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema, field = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[field]);
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
      let customErrors: Record<string, string> = {};
  
      for (const key in formattedErrors) {
        const errorFormattedItem = formattedErrors[key];
        if (errorFormattedItem?.length) {
          customErrors[key] = errorFormattedItem[0];
        }
      }
      
      return res.status(STATUS_CODE.BAD_REQUEST).json({ errors: customErrors });;
    }
  
    next();
  }
};
