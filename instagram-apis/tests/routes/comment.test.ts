// libs
import { SuperTest, Test } from "supertest";
import { API_ENDPOINTS, STATUS_CODE, MESSAGES } from "@/constants";
import { COMMENTS_PAGINATION } from "@/mocks";

const { ADD } = MESSAGES.SUCCESS;
const postId = 1;

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

jest.mock('@/middlewares/validate-request.middleware', () => ({
  __esModule: true,
  validateRequest: jest.fn(() => (req: any, res: any, next: any) => next())
}));

jest.mock('@/controllers/comment.controller', () => ({
  commentController: {
    getAll: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ data: COMMENTS_PAGINATION })),
    getPostsComment: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ data: COMMENTS_PAGINATION })),
    getPostsCommentById: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ data: COMMENTS_PAGINATION[0] })),
    postPostsComments: jest.fn((_req, res) => res.status(STATUS_CODE.CREATED).json({ message: ADD, data: COMMENTS_PAGINATION[0] })),
    deletePostsComments: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).end()),
    deletePostsCommentById: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).end()),
  }
}));

jest.mock('@/services/comment.service', () => ({
  commentServices: {
    getPostsComment: jest.fn()
  }
}));

let app: any;
let requestApp: SuperTest<Test>;

describe('Comments routes for success', () => {
  let commentController: any;
  let postService: any;
  let commentServices: any;

  const pathPostComments = `${API_ENDPOINTS.POST_COMMENTS.replace(':id', postId.toString())}`;
  const pathPostCommentsId = `${API_ENDPOINTS.POST_COMMENT_BY_ID.replace(':id', postId.toString()).replace(':commentId', '1')}`;

  beforeAll(() => {
    jest.isolateModules(() => {
      const { commentsRouter } = require('@/routes/comments.route');
      const express = require('express');

      commentController = require('@/controllers/comment.controller').commentController;
      postService = require('@/services/post.service').postService;
      commentServices = require('@/services/comment.service').commentServices;

      app = express();
      app.use(express.json());
      commentsRouter(app);
      requestApp = require('supertest')(app);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it(`GET ${API_ENDPOINTS.COMMENTS} success`, async () => {
    const res = await requestApp.get(API_ENDPOINTS.COMMENTS);

    expect(commentController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.data).toStrictEqual(COMMENTS_PAGINATION);
  });

  it(`GET ${API_ENDPOINTS.POST_COMMENTS} success`, async () => {
    commentServices.getPostsComment.mockResolvedValueOnce(COMMENTS_PAGINATION);
    const res = await requestApp.get(pathPostComments);

    expect(commentController.getPostsComment).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.data).toStrictEqual(COMMENTS_PAGINATION);
  });

  it(`GET ${API_ENDPOINTS.POST_COMMENT_BY_ID} success`, async () => {
    const res = await requestApp.get(pathPostCommentsId);

    expect(commentController.getPostsCommentById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.data).toStrictEqual(COMMENTS_PAGINATION[0]);
  });

  it(`POST ${API_ENDPOINTS.POST_COMMENTS} success`, async () => {
    const res = await requestApp.post(pathPostComments);

    expect(commentController.postPostsComments).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.CREATED);
    expect(res.body.data).toStrictEqual(COMMENTS_PAGINATION[0]);
  });

  it(`DELET ${API_ENDPOINTS.POST_COMMENTS} success`, async () => {
    const res = await requestApp.delete(pathPostComments);

    expect(commentController.deletePostsComments).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });

  it(`DELET ${API_ENDPOINTS.POST_COMMENT_BY_ID} success`, async () => {
    const res = await requestApp.delete(pathPostCommentsId);

    expect(commentController.deletePostsCommentById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });
});
