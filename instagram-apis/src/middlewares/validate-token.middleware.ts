// libs
import { NextFunction, Request, Response } from "express";

import { MESSAGES_AUTHENTICATION, STATUS_CODE } from "@/constants";
import { generateToken } from "@/utils";
import { RequestAuthenType } from "@/types";
import HttpExeptionError from "@/exceptions";

export const validateToken = (req: RequestAuthenType,res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) return next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.UN_AUTHORIZATION));
  const token = authHeader ? authHeader.split(' ')[1] : '';

  try {
    const decode = generateToken.decodeToken(token);

    // checking expiration time
    if (decode.exp && decode.exp < Date.now() / 1000) {
      return next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.ACCESS_TOKEN_EXPIRED));
    }

    req.user = decode;
    next();
  } catch (error) {

    next(new HttpExeptionError(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.INVALID_TOKEN))
  }
};
