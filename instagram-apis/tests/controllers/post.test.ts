// libs
import 'jest';
import { NextFunction, Request, Response } from 'express';

import { postController } from "@/controllers";
import { postService, userServices } from '@/services';
import { MESSAGES, MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE } from '@/constants';
import { MOCKS_POSTS } from '@/mocks';
import HttpExeptionError from '@/exceptions';

jest.mock('@/services');

describe('Post controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  const { OFFSET, LIMIT } = PAGINATION.DEFAULT;
  const { UPDATE } = MESSAGES.SUCCESS;

  beforeEach(() => {
    req = {
      query: {
        offset: OFFSET.toString(),
        limit: LIMIT.toString(),
      },
      params: {
        userId: '1',
        id: '1'
      },
      body: {
        post: MOCKS_POSTS[0]
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    (postService.getAll as jest.Mock).mockReset();
    (postService.get as jest.Mock).mockReset();
    (postService.create as jest.Mock).mockReset();
    (postService.update as jest.Mock).mockReset();
    (postService.existSlug as jest.Mock).mockReset();
    (postService.getPostByAuthorId as jest.Mock).mockReset();
    (postService.deletePosts as jest.Mock).mockReset();
    (postService.deleteUsersPostById as jest.Mock).mockReset();
    (userServices.getUserById as jest.Mock).mockReset();
  });

  describe('Get all Posts', () => {
    it('should return all posts', async () => {
      (postService.getAll as jest.Mock).mockResolvedValueOnce(MOCKS_POSTS);

      await postController.getAll(req as Request, res as Response, next as NextFunction);

      expect(postService.getAll).toHaveBeenCalledWith(OFFSET, LIMIT);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: MOCKS_POSTS });
    });

    it('should handle error when getting all posts', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (postService.getAll as jest.Mock).mockRejectedValueOnce(error);

      await postController.getAll(req as Request, res as Response, next as NextFunction);

      expect(postService.getAll).toHaveBeenCalledWith(OFFSET, LIMIT);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Get Post by ID', () => {
    it('should return post by ID', async () => {
      (postService.get as jest.Mock).mockResolvedValueOnce(MOCKS_POSTS[0]);

      await postController.getPostById(req as Request, res as Response, next as NextFunction);

      expect(postService.get).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ data: MOCKS_POSTS[0] });
    });

    it('should handle error when getting post by ID', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (postService.get as jest.Mock).mockRejectedValueOnce(error);

      await postController.getPostById(req as Request, res as Response, next as NextFunction);

      expect(postService.get).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Create Post by User', () => {
    it('should create a post', async () => {
      (postService.existSlug as jest.Mock).mockResolvedValueOnce(false);
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.create as jest.Mock).mockResolvedValueOnce({ ...MOCKS_POSTS[0], authorId: 1 });

      await postController.createPostByUser(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
      expect(res.json).toHaveBeenCalledWith({ data: { ...MOCKS_POSTS[0], authorId: 1 } });
    });

    it('should handle error when creating a post with existing slug', async () => {
      (postService.existSlug as jest.Mock).mockResolvedValueOnce({ slug: 'animals-post' });

      await postController.createPostByUser(req as Request, res as Response, next as NextFunction);

      expect(postService.existSlug).toHaveBeenCalledWith(req.body.slug);
      expect(next).toHaveBeenCalledWith(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES.ERRORS.POST.INVALID_SLUG));
    });

    it('should handle error when creating a post with non-existing user', async () => {
      (postService.existSlug as jest.Mock).mockResolvedValueOnce(false);
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce(null);

      await postController.createPostByUser(req as Request, res as Response, next as NextFunction);

      expect(userServices.getUserById).toHaveBeenCalledWith(req.body.authorId);
      expect(next).toHaveBeenCalledWith(new HttpExeptionError(STATUS_CODE.BAD_REQUEST, MESSAGES.ERRORS.POST.USER_NOT_FOUND));
    });

    it('should handle error when creating a post', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (postService.existSlug as jest.Mock).mockResolvedValueOnce(false);
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });

      (postService.create as jest.Mock).mockRejectedValueOnce(error);

      await postController.createPostByUser(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Update Post by User', () => {
    it('should update a post by user ID and post ID', async () => {
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockResolvedValueOnce({ ...MOCKS_POSTS[0], authorId: 1 });
      (postService.update as jest.Mock).mockResolvedValueOnce({ ...MOCKS_POSTS[0], authorId: 1 });

      await postController.putUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(userServices.getUserById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NO_CONTENT);
    });

    it('should handle error when updating a post with non-existing user', async () => {
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce(null);

      await postController.putUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(userServices.getUserById).toHaveBeenCalledWith(1);
      expect(next).toHaveBeenCalledWith(new HttpExeptionError(STATUS_CODE.NOT_FOUND, MESSAGES_AUTHENTICATION.USER_NOT_FOUND));
    });

    it('should handle error when updating a post with non-existing post', async () => {
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockResolvedValueOnce(null);

      await postController.putUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(postService.getPostByAuthorId).toHaveBeenCalledWith(1, 1);
      expect(next).toHaveBeenCalledWith(new HttpExeptionError(STATUS_CODE.NOT_FOUND, MESSAGES.ERRORS.POST.NOT_FOUND_OWNED_USER));
    });

    it('should handle error something conflict when updating a post', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.CONFLICT,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockResolvedValueOnce({ ...MOCKS_POSTS[0], authorId: 1 });
      (postService.update as jest.Mock).mockRejectedValueOnce(error);
    }); 

    it('should handle error when updating a post', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockRejectedValueOnce(error);

      await postController.putUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Delete Posts', () => {
    it('should delete all posts', async () => {
      await postController.deletePosts(req as Request, res as Response, next as NextFunction);

      expect(postService.deletePosts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NO_CONTENT);
    });

    it('should handle error when deleting posts', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (postService.deletePosts as jest.Mock).mockRejectedValueOnce(error);

      await postController.deletePosts(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Delete User\'s Post by ID', () => {
    it('should delete a user\'s post by user ID and post ID', async () => {
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockResolvedValueOnce({ ...MOCKS_POSTS[0], authorId: 1 });
      (postService.deleteUsersPostById as jest.Mock).mockResolvedValueOnce({ message: null });

      await postController.deleteUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(postService.getPostByAuthorId).toHaveBeenCalledWith(1, 1);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.NO_CONTENT);
    });

    it('should handle error when deleting a user\'s post with non-existing post', async () => {
      (postService.getPostByAuthorId as jest.Mock).mockResolvedValueOnce(null);

      await postController.deleteUsersPostById(req as Request, res as Response, next as NextFunction);

      expect(postService.getPostByAuthorId).toHaveBeenCalledWith(1, 1);
      expect(next).toHaveBeenCalledWith(new HttpExeptionError(STATUS_CODE.NOT_FOUND, MESSAGES.NOT_FOUND));
    });

    it('should handle error when deleting a user\'s post', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (userServices.getUserById as jest.Mock).mockResolvedValueOnce({ userId: 1 });
      (postService.getPostByAuthorId as jest.Mock).mockRejectedValueOnce(error);

      await postController.deleteUsersPostById(req as Request, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});