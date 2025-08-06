// libs
import { SuperTest, Test } from "supertest";
import { API_ENPOINTS, STATUS_CODE, MESSAGES } from "@/constants";

const { UPDATE, ADD, DELETE } = MESSAGES.SUCCESS;
const mockingUsers = [
  {
    "userId": 7,
    "email": "abc@gmail.com",
    "username": "admin",
    "isAdmin": 1,
    "createdAt": "2025-08-04 04:21:23.603 +00:00",
    "updatedAt": "2025-08-04 04:21:23.603 +00:00"
  }
];

jest.mock('@/middlewares/validate-request.middleware', () => ({
  __esModule: true,
  validateRequest: jest.fn(() => (req: any, res: any, next: any) => next())
}));

jest.mock('@/controllers/user.controller', () => ({
  userController: {
    getAll: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: ADD, data: mockingUsers })),
    getUserById: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: ADD, data: mockingUsers[0] })),
    updateUserById: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).json({ message: UPDATE })),
    updateUsers: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).json({ message: UPDATE })),
    deleteUserById: jest.fn((_req, res) => res.status(STATUS_CODE.NO_CONTENT).json({ message: DELETE })),
    deleteUsers: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: DELETE })),
  }
}))

let app: any;
let requestApp: SuperTest<Test>;

describe('User routes for success', () => {
  let userController: any;

  beforeAll(() => {
    jest.isolateModules(() => {
      const { userRouter } = require('@/routes/user.route');
      const express = require('express');

      userController = require('@/controllers/user.controller').userController;

      app = express();
      app.use(express.json());
      userRouter(app);
      requestApp = require('supertest')(app);
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it(`GET: ${API_ENPOINTS.USERS} success`, async () => {
    const res = await requestApp.get(API_ENPOINTS.USERS);

    expect(userController.getAll).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.message).toBe(ADD);
    expect(res.body.data).toStrictEqual(mockingUsers);
  });

  it(`GET ${API_ENPOINTS.USER_BY_ID} success`, async () => {
    const res = await requestApp.get(API_ENPOINTS.USER_BY_ID);

    expect(userController.getUserById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.message).toBe(ADD);
    expect(res.body.data).toStrictEqual(mockingUsers[0]);
  });

  it(`PUT ${API_ENPOINTS.USER_BY_ID} success`, async () => {
    const res = await requestApp
      .put(API_ENPOINTS.USER_BY_ID)
      .send({ username: "abc" });

    expect(userController.getUserById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });

  it(`PUT ${API_ENPOINTS.USERS} success`, async () => {
    const res = await requestApp
      .put(API_ENPOINTS.USERS)
      .send({ email: "abc@gmail.com" })

    expect(userController.getUserById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });

  it(`DELETE ${API_ENPOINTS.USERS} success`, async () => {
    const res = await requestApp.delete(API_ENPOINTS.USERS);

    expect(userController.deleteUsers).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.OK);
    expect(res.body.message).toBe(MESSAGES.SUCCESS.DELETE)
  });

  it(`DELETE ${API_ENPOINTS.USER_BY_ID} success`, async () => {
    const res = await requestApp.delete(API_ENPOINTS.USER_BY_ID);

    expect(userController.deleteUserById).toHaveBeenCalled();
    expect(res.status).toBe(STATUS_CODE.NO_CONTENT);
  });
});