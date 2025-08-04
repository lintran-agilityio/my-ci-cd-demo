// libs
import { NextFunction, Request, Response } from "express";

import { MESSAGES, MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE } from "@/constants";
import { postService, userServices } from "@/services";
import { logger, toError } from "@/utils";
import HttpExeptionError from "@/exceptions";
import { RequestAuthenType } from "@/types";

class PostsController {
  private errorPostMessage = MESSAGES.ERRORS.POST;

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

  getPostById = async(req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const postId = Number(id);
      const dataRes = await postService.get(postId);

      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
    }
  };

  createPostByUser = async(req: Request, res: Response, next: NextFunction) => {
    const { body } = req;

    try {
      const { authorId, slug } = body;

      // Valid unique slug
      const slugExiting = await postService.existSlug(slug);

      if (slugExiting) {
        next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, this.errorPostMessage.INVALID_SLUG));
      }

      const user = await userServices.getUserById(authorId);

      if (!user) return next(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, this.errorPostMessage.USER_NOT_FOUND));

      const dataRes = await postService.create(body);

      return res.status(STATUS_CODE.CREATED).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  putUsersPostById = async(req: Request, res: Response, next: NextFunction) => {
    const { userId, id } = req.params;
    const payload = req.body;

    try {
      const userIdNumber = Number(userId);
      const idNumber = Number(id);

      // find users by userId
      const user = await userServices.getUserById(userIdNumber);
      if (!user) return next(new HttpExeptionError(STATUS_CODE.NOT_FOUND, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
      
      // find the post with userId
      const post = await postService.getPostByAuthorId(userIdNumber, idNumber);
      if (!post) return next(new HttpExeptionError(STATUS_CODE.NOT_FOUND, this.errorPostMessage.NOT_FOUND_OWNED_USER));
 

      const { message } = await postService.update(post, { ...payload, id: idNumber, authorId: userIdNumber });

      if (message) return next(new HttpExeptionError(STATUS_CODE.CONFLICT, message));

      return res.status(STATUS_CODE.NO_CONTENT).json({ message: MESSAGES.SUCCESS.UPDATE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deletePosts = async(_req: Request, res: Response, next: NextFunction) => {
    try {
      await postService.deletePosts();
      return res.status(STATUS_CODE.NO_CONTENT).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deleteUsersPostById = async(req: RequestAuthenType, res: Response, next: NextFunction) => {
    const { userId, id } = req.params;
    const isAdminUser = req.isAdmin || false;
    const currentUserId = req.userId || 0;

    try {
      const userIdNumber = Number(userId);
      const postId = Number(id);
      const post = await postService.getPostByAuthorId(userIdNumber, postId);

      if (!post) return next(new HttpExeptionError(STATUS_CODE.NOT_FOUND, MESSAGES.NOT_FOUND));

      const { message } = await postService.deleteUsersPostById(postId, currentUserId, isAdminUser, userIdNumber);

      if (message) {
        return next(new HttpExeptionError(STATUS_CODE.FORBIDDEN, message));
      }

      return res.status(STATUS_CODE.NO_CONTENT).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);

      next(new HttpExeptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };
};

export const postController = new PostsController();
