// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { postController } from '@/controllers/post.controller';
import { validateToken } from '@/middlewares/validate-token.middleware';
import { validateRequest } from '@/middlewares/validate-request.middleware';
import { createPostSchema } from '@/validation';

export const postsRouter = (app: Application) => {
  app.get(API_ENPOINTS.POSTS, validateToken, postController.getAll);

  app.post(API_ENPOINTS.POSTS, validateToken, validateRequest(createPostSchema, 'body'), (req, res, next) => {
    postController.createPostByUser(req, res, next);
  });
};