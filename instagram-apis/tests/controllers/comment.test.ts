// libs
import 'jest';
import express, { NextFunction, Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

jest.mock('jwt-simple', () => ({
  __esModule: true,
  ...jest.requireActual('jwt-simple'),
  decode: jest.fn(),
  encode: jest.fn()
}));

jest.mock('@/middlewares/auth.middleware', () => ({
  __esModule: true,
  default: jest.fn(() => {
    return (req: any, res: any, next: any) => {
      req.userId = 1;
      req.isAdmin = true;
      next();
    };
  }),
}));

import { sequelize } from "@/configs";
import HttpExceptionError from '@/exceptions';
import { API_ENDPOINTS, MESSAGES, MESSAGES_AUTHENTICATION, STATUS_CODE } from '@/constants';
import { commentController } from '@/controllers';
import { Comment, Post } from '@/models';
import { MOCKS_POSTS } from '@/mocks';
import validateToken from '@/middlewares/auth.middleware';
import { generateToken } from '@/utils';

const app: Express = express();
app.use(bodyParser.json());

describe('Comments controller', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });
  
  describe('Comments: Get comments of post', () => {
    app.get(API_ENDPOINTS.POST_COMMENTS, commentController.getPostsComment);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should get post comments: return comments', async () => {
      jest.spyOn(Comment, "findAndCountAll").mockResolvedValue({
        count: 2,
        rows: MOCKS_POSTS,
      } as any);      
      const response = await request(app)
        .get(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .query({ offset: 0, limit: 10 });

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data).toEqual({
        data: MOCKS_POSTS,
        meta: {
          pagination: {
            offset: 0,
            limit: 10,
            total: 2,
          }
        }
      });
    });

    it('Should return error: internal server error', async () => {
      const errorMessage = MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      const error = new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, errorMessage);
      jest.spyOn(Comment, "findAndCountAll").mockRejectedValue(error);

      const response = await request(app)
        .get(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .query({ offset: 0, limit: 10 });

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('Comments: Get comment by ID', () => {
    app.get(API_ENDPOINTS.POST_COMMENT_BY_ID, commentController.getPostsCommentById);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should get post comment by ID: return comment', async () => {
      jest.spyOn(Comment, "findOne").mockResolvedValue(MOCKS_POSTS[0] as any);
      const response = await request(app)
        .get(API_ENDPOINTS.POST_COMMENT_BY_ID.replace(':id', '1').replace(':commentId', '1'));

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data).toEqual(MOCKS_POSTS[0]);
    });

    it('Should return error: comment not found', async () => {
      const errorMessage = MESSAGES.ERRORS.COMMENT.NOT_FOUND;
      const error = new HttpExceptionError(STATUS_CODE.NOT_FOUND, errorMessage);
      jest.spyOn(Comment, "findOne").mockResolvedValue(null);

      const response = await request(app)
        .get(API_ENDPOINTS.POST_COMMENT_BY_ID.replace(':id', '1').replace(':commentId', '1'));

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(errorMessage);
    });

    it('Should return error: internal server error', async () => {
      const errorMessage = MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR;
      const error = new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, errorMessage);
      jest.spyOn(Comment, "findOne").mockRejectedValue(error);

      const response = await request(app)
        .get(API_ENDPOINTS.POST_COMMENT_BY_ID.replace(':id', '1').replace(':commentId', '1'));

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('Comments: Create comment for post', () => {
    app.post(API_ENDPOINTS.POST_COMMENTS, commentController.postPostsComments);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should create post comment: return created comment', async () => {
      jest.spyOn(Post, "findOne").mockResolvedValue(MOCKS_POSTS[0] as any);
      jest.spyOn(Comment, "create").mockResolvedValue(MOCKS_POSTS[0] as any);

      const response = await request(app)
        .post(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .send({ content: 'This is a comment' });

      expect(response.status).toBe(STATUS_CODE.CREATED);
      expect(response.body.data).toEqual(MOCKS_POSTS[0]);
    });

    it('Should return error: post not found', async () => {
      const errorMessage = MESSAGES.ERRORS.POST.NOT_FOUND;
      const error = new HttpExceptionError(STATUS_CODE.NOT_FOUND, errorMessage);
      jest.spyOn(Post, "findOne").mockResolvedValue(null);

      const response = await request(app)
        .post(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .send({ content: 'This is a comment' });

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(errorMessage);
    });

    it('Should return error: internal server error', async () => {
      const errorMessage = MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR;
      const error = new HttpExceptionError(STATUS_CODE.INTERNAL_SERVER_ERROR, errorMessage);
      jest.spyOn(Post, "findOne").mockRejectedValue(error);

      const response = await request(app)
        .post(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .send({ content: 'This is a comment' });

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('Comments: Delete comment for post', () => {
    
    beforeEach(() => {
      jest.spyOn(generateToken, 'decodeToken').mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 60,
        isAdmin: true,
        userId: 1
      });
      app.delete(API_ENDPOINTS.POST_COMMENTS, validateToken(), commentController.deletePostsComments);
      
      // Middleware handle error
      app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
        res.status(err.status || 500).json({ message: err.message });
      });
    });

    afterAll(async () => {
      jest.restoreAllMocks();
    });

    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoibGluKzNAZ20uY29tIiwidXNlcm5hbWUiOiJsaW50cmFuIiwiaXNBZG1pbiI6ZmFsc2UsImV4cCI6MTc1NDkwMjczNX0.k_Qw9EFjykTYm3Y2RE3NZLv6GkQx7dod8Gh5jyxK4-k';
    it('Should delete post comment: return success message', async () => {
      
      jest.spyOn(Comment, "destroy").mockResolvedValue(1);

      const response = await request(app)
        .delete(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(STATUS_CODE.NO_CONTENT);
    });

    it('Should return error: comment not found', async () => {

      const errorMessage = MESSAGES.ERRORS.COMMENT.NOT_FOUND_COMMENT_OR_POST;
      jest.spyOn(Comment, "destroy").mockResolvedValue(0);

      const response = await request(app)
        .delete(API_ENDPOINTS.POST_COMMENTS.replace(':id', '1'))
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
