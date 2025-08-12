// libs
import { NextFunction, Request, Response } from "express";

import { MESSAGES, PAGINATION, STATUS_CODE } from "@/constants";
import { commentServices, postService } from "@/services";
import { logger, toError } from "@/utils";
import HttpExceptionError from "@/exceptions";
import { RequestAuthenticationType } from "@/types";

class CommentsController {
  getPostsComment = async(req: Request, res: Response, next: NextFunction) => {
    const { DEFAULT: { OFFSET, LIMIT } } = PAGINATION;
    const { offset =  OFFSET, limit = LIMIT } = req.query;
    const { id } = req.params;
    const limitNumber = Number(limit);
    const offsetNumber = Number(offset);
    const postId = Number(id);

    try {
      const dataRes = await commentServices.getPostsComment(offsetNumber, limitNumber, postId);
      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  getPostsCommentById = async(req: Request, res: Response, next: NextFunction) => {
    const { id, commentId } = req.params;
    const postId = Number(id);
    const commentIdNumber = Number(commentId);

    try {
      const dataRes = await commentServices.getPostsCommentById(commentIdNumber, postId);

      if (!dataRes) return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES.ERRORS.COMMENT.NOT_FOUND));

      return res.status(STATUS_CODE.OK).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  postPostsComments = async(req: RequestAuthenticationType, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId || 0;
    const postId = Number(id);

    try {
      const post = await postService.get(postId);
      if (!post) return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES.ERRORS.POST.NOT_FOUND));

      const dataRes = await commentServices.create({
        postId,
        authorId: userId,
        content
      });

      return res.status(STATUS_CODE.CREATED).json({ data: dataRes });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deletePostsComments = async(req: RequestAuthenticationType, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const postId = Number(id);
    try {
      const dataRes = await commentServices.deletePostsComments(postId);
      if (dataRes === 0) {
        return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES.ERRORS.COMMENT.NOT_FOUND_COMMENT_OR_POST));
      }

      return res.status(STATUS_CODE.NO_CONTENT).json({ message: MESSAGES.SUCCESS.DELETE });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  };

  deletePostsCommentById = async(req: RequestAuthenticationType, res: Response, next: NextFunction) => {
    const { id, commentId } = req.params;
    const postId = Number(id);
    const commentNumberId = Number(commentId);

    try {
      const deletedCount = await commentServices.deletePostsCommentById(postId, commentNumberId);
      if (deletedCount === 0) {
        return next(new HttpExceptionError(STATUS_CODE.NOT_FOUND, MESSAGES.ERRORS.COMMENT.NOT_FOUND_COMMENT_OR_POST));
      }

      return res.status(STATUS_CODE.NO_CONTENT).json({ message: MESSAGES.SUCCESS.DELETE, data: deletedCount });
    } catch (error) {
      const { message } = toError(error);
      logger.error(message);
      
      next(new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
    }
  }
};

export const commentController = new CommentsController();
