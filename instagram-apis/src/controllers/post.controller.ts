// libs
import { NextFunction, Request, Response } from "express";

import { MESSAGES, PAGINATION, STATUS_CODE } from "@/constants";
import { postService, userServices } from "@/services";
import { logger, toError } from "@/utils";
import HttpExeptionError from "@/exceptions";

class PostsController {
  getAll = async(req: Request, res: Response, next: NextFunction) => {
    const { DEFAULT: { OFFSET, LIMIT } } = PAGINATION;
    const { offset =  OFFSET, limit = LIMIT } = req.query;
    const limitNumber = Number(limit);
    const offsetNumber = Number(offset);

    try {
      const dataRes = await postService.getAll(offsetNumber, limitNumber);
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  createPostByUser = async(req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    try {
      const { authorId, slug } = body;

      // Valid unique slug
      const slugExiting = await postService.existSlug(slug);

      if (slugExiting) {
        next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES.ERRORS.POST.INVALID_SLUG));
      }

      const user = await userServices.getUserById(authorId);

      if (!user) return next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES.ERRORS.POST.USER_NOT_FOUND));

      const dataRes = await postService.create(body);

      return res.status(STATUS_CODE.CREATED).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  }
};

export const postController = new PostsController();
