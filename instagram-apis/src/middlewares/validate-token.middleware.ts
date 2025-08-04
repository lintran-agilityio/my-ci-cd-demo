// libs
import { NextFunction, Response } from "express";

import { MESSAGES, MESSAGES_AUTHENTICATION, STATUS_CODE } from "@/constants";
import { generateToken } from "@/utils";
import { RequestAuthenType } from "@/types";
import HttpExeptionError from "@/exceptions";

export const validateToken = (isValidAdmin?: boolean) => {
  return (req: RequestAuthenType, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.UN_AUTHORIZATION));
    }

    const token = authHeader.split(' ')[1];

    try {
      const decode = generateToken.decodeToken(token);
      const { exp, isAdmin, userId } = decode;

      // checking expiration time
      if (exp && exp < Date.now() / 1000) {
        return next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.ACCESS_TOKEN_EXPIRED));
      }

      if (isValidAdmin && !isAdmin) {
        return next(new HttpExeptionError(STATUS_CODE.FORBIDDEN, MESSAGES.ERRORS.NO_PERMISSION));
      }

      req.userId = userId;
      req.isAdmin = isAdmin;
      next();
    } catch (error) {

      next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.INVALID_TOKEN));
    }
  }
};
