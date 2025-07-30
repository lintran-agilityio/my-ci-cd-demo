// libs
import { NextFunction, Request, Response } from "express";

import { MESSAGES_AUTHENTICATION, STATUS_CODE } from "@/constants";
import { generateToken, globalErrorHandler } from "@/utils";
import { RequestAuthenType } from "@/types";

export const validateToken = (req: RequestAuthenType,res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) return next(globalErrorHandler(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.UN_AUTHORIZATION));
  const token = authHeader ? authHeader.split(' ')[1] : '';

  try {
    const decode = generateToken.decodeToken(token);

    // checking expiration time
    if (decode.exp && decode.exp < Date.now() / 1000) {
      return next(globalErrorHandler(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.ACCESS_TOKEN_EXPIRED));
    }

    req.user = decode;
    next();
  } catch (error) {

    next(globalErrorHandler(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.INVALID_TOKEN))
  }
};
