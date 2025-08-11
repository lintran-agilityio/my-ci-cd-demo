// libs
import { NextFunction, Request, Response } from "express";

import { userServices } from "@/services";
import { MESSAGES, MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE } from "@/constants";
import { logger, toError } from "@/utils";
import HttpExceptionError from "@/exceptions";
import { IUser } from "@/types";

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
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const userIdNumber = Number(userId);
      const dataRes = await userServices.getUserById(userIdNumber);

      if (!dataRes) return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
        
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  updateUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { users = [] } = req.body;

      // Valid duplicate email in payload
      const userEmails = users.map((u: IUser) => u.email).filter(Boolean);
      const emailNoDuplicate = new Set(userEmails);

      if (emailNoDuplicate.size !== userEmails.length) {
        return next(new HttpExceptionError(STATUS_CODE.BAD_REQUEST, "Duplicate email in user' payload"))
      }

      // Valid email' unique in DB
      if (userEmails.length > 0) {
        const emailsDuplicate = await userServices.checkExistingEmails(users, userEmails);

        if (emailsDuplicate?.length > 0) {
          return res.status(STATUS_CODE.BAD_REQUEST).json({
            message: "Some emails already exist",
            data: emailsDuplicate
          })
        }
      }
      const dataRes = await userServices.updateUsers(users);

      if (dataRes && dataRes.length === 0) {
        return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES.NOT_FOUND));
      }

      return res.status(STATUS_CODE.OK).json({
        message: MESSAGES.SUCCESS.UPDATE,
        data: dataRes
      });
    } catch (error: unknown) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { username, email, isAdmin } = req.body;

    try {
      const userIdNumber = Number(userId);
      if (email) {
        const existingEmail = await userServices.checkExistingEmail(userIdNumber, email);
        if (existingEmail && Object.keys(existingEmail).length) {
          return next(new HttpExceptionError(STATUS_CODE.BAD_REQUEST, `Email ${email} existing`));
        }
      }
      
      const dataRes = await userServices.updateUserById(userIdNumber, username, email, isAdmin);

      if (!dataRes) return next(new HttpExceptionError(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));

      // fetch updated user
      const updatedUser = await userServices.getUserById(userIdNumber);
      
      return res.status(STATUS_CODE.OK).json({
        message: MESSAGES.SUCCESS.UPDATE,
        data: updatedUser
      });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deleteUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await userServices.deleteUsers();

      return res.status(STATUS_CODE.OK).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error: unknown) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
      const userIdNumber = Number(userId);
      const dataRes = await userServices.deleteUserById(userIdNumber);

      if (dataRes === 0) return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      return res.status(STATUS_CODE.OK).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };
};

export const userController = new UsersController();
