// libs
import { SuperTest, Test } from "supertest";
import { API_ENPOINTS, STATUS_CODE, MESSAGES } from "@/constants";

const { UPDATE, ADD } = MESSAGES.SUCCESS;

// ✅ Mock HOF: validateToken() → middleware
jest.mock('@/middlewares/validate-token.middleware', () => ({
  __esModule: true,
  validateToken: (isValidAdmin?: boolean) => {
    return (req: any, res: any, next: any) => {
      req.user = { userId: 1, admin: isValidAdmin || false}

      next();
    }
  }
}));

jest.mock('@/middlewares/validate-request.middleware', () => ({
  __esModule: true,
  validateRequest: jest.fn(() => (req: any, res: any, next: any) => next())
}));

jest.mock('@/services/user.service', () => ({
  userServices: {
    getUserById: jest.fn(() => Promise.resolve({
      userId: 1,
      email: 'abc@gmail.com',
      username: 'admin',
      admin: true
    }))
  }
}));

jest.mock('@/services/post.service', () => ({
  postService: {
    getPostByAuthorId: jest.fn(() => Promise.resolve({
      id: 1,
      title: 'post 1',
      slug: 'post-1',
      content: 'post content',
      authorId: 1,
      status: 'draft'
    })),
    update: jest.fn(() => Promise.resolve({ message: UPDATE }))
  }
}));

jest.mock('@/controllers/post.controller', () => ({
  postController: {
    getAll: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: ADD, data: [] })),
    getPostById: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: ADD })),
    createPostByUser: jest.fn((_req, res) => res.status(STATUS_CODE.CREATED).json({ message: ADD })),
    putUsersPostById: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).json({ message: UPDATE })),
    deletePosts: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).end())
  }
}));

let app: any;
let requestApp: SuperTest<Test>;

describe('Posts routes for success', () => {
  let postController: any;
  let userServices: any;
  let postService: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      const { postsRouter } = require('@/routes/posts.route');
      const express = require('express');

      postController = require('@/controllers/post.controller').postController;
      userServices = require('@/services/user.service').userServices;
      postService = require('@/services/post.service').postService;

      app = express();
      app.use(express.json());
      postsRouter(app);
      requestApp = require('supertest')(app);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it(`GET: ${API_ENPOINTS.POSTS} success`, async () => {
    const res = await requestApp.get(API_ENPOINTS.POSTS);

    expect(postController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.message).toBe(ADD);
  });

  it(`GET: ${API_ENPOINTS.POST_BY_ID} success`, async () => {
    const res = await requestApp.get(API_ENPOINTS.POST_BY_ID.replace(':id', '1'));

    expect(postController.getPostById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.message).toBe(ADD);
  });

  it(`POST: ${API_ENPOINTS.POSTS} create a post`, async () => {
    const res = await requestApp
      .post(API_ENPOINTS.POSTS)
      .send({
        title: "Post 1",
        slug: "post-1",
        content: "content of post 1",
        authorId: 1,
        status: 'draft'
      });

    expect(postController.createPostByUser).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.CREATED);
    expect(res.body.message).toBe(ADD);
  });

  it(`PUT: ${API_ENPOINTS.USERS_POST_ID} update a post`, async () => {
    const path = API_ENPOINTS.USERS_POST_ID.replace(':userId', '1').replace(':id', '1');

    const res = await requestApp
      .put(path)
      .send({
        title: "Post 1 update",
        slug: "post-1-update",
        content: "content of post 1 update",
        authorId: 1,
        status: 'published'
      });

    expect(postController.putUsersPostById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });

  it(`DELETE: ${API_ENPOINTS.POSTS} delete all posts`, async () => {
    const res = await requestApp.delete(API_ENPOINTS.POSTS);

    expect(postController.deletePosts).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  }, 15000);
});