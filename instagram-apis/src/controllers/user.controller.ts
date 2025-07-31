// libs
import { NextFunction, Request, Response } from "express";

import { userServices } from "@/services";
import { MESSAGES, MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE } from "@/constants";
import { logger, toError } from "@/utils";
import HttpExeptionError from "@/exceptions";

class UsersController {
  getAll = async(req: Request, res: Response, next: NextFunction) => {
    const { DEFAULT: { OFFSET, LIMIT } } = PAGINATION;
    const { offset =  OFFSET, limit = LIMIT } = req.query;
    const limitNumber = Number(limit);
    const offsetNumber = Number(offset);

    try {
      const dataRes = await userServices.getAll(offsetNumber, limitNumber);
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
      
      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const userIdNumber = Number(userId);
      const dataRes = await userServices.getUserById(userIdNumber);
        
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { username, email, isAdmin } = req.body;

    try {
      const userIdNumber = Number(userId);

      const dataRes = await userServices.updateUserById(userIdNumber, username, email, isAdmin);

      if (dataRes === 0) return next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      return res.status(STATUS_CODE.OK).json({ messgae: MESSAGES.SUCCESS.UPDATE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const userIdNumber = Number(userId);
      const dataRes = await userServices.deleteUserById(userIdNumber);

      if (dataRes === 0) return next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      return res.status(STATUS_CODE.OK).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };
};

export const userController = new UsersController();
