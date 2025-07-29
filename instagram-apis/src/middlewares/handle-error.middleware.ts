// libs
import { Request, Response, NextFunction } from "express";

import { MESSAGES, STATUS_CODE } from "@/constants";
import { IErrorWithStatus } from "@/types";

export const globalErrorMiddleware = (error: IErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message
  });
};

export const handleNotFoundRoute = (req: Request, res: Response) => {
  const { NOT_FOUND } = STATUS_CODE;
  
  res.status(NOT_FOUND).json({
    error: MESSAGES.NOT_FOUND
  });
};