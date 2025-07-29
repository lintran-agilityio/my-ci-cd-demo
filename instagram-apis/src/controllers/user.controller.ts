// libs
import { NextFunction, Request, Response } from "express";

import { userServices } from "@/services";
import { MESSAGES, MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE } from "@/constants";
import { globalErrorHandler, logger, toError } from "@/utils";

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
      next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
      
      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;

    try {
      const userId = Number(user_id);
      const dataRes = await userServices.getUserById(userId);
        
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;
    const { username, email } = req.body;

    try {
      const userId = Number(user_id);

      const dataRes = await userServices.updateUserById(userId, username, email);

      if (dataRes === 0) return next(globalErrorHandler(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      return res.status(STATUS_CODE.OK).json({ messgae: MESSAGES.SUCCESS.UPDATE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { user_id } = req.params;

    try {
      const userId = Number(user_id);
      const dataRes = await userServices.deleteUserById(userId);

      if (dataRes === 0) return next(globalErrorHandler(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      return res.status(STATUS_CODE.OK).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };
};

export const userController = new UsersController();
