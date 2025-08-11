// libs
import request from "supertest";
import express, { Application } from "express"

import { authenticationController } from "@/controllers";
import { authenticationRouter } from "@/routes/authetication.route";
import { API_ENDPOINTS, STATUS_CODE, MESSAGES_AUTHENTICATION } from "@/constants";

const { SUCCESSFUL } = MESSAGES_AUTHENTICATION;

jest.mock('@/controllers/authentication.controller', () => ({
  authenticationController: {
    login: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: SUCCESSFUL })),
    register: jest.fn((_req, res) => res.status(STATUS_CODE.OK).json({ message: SUCCESSFUL })),
  }
}));

describe('Authentication routes for authen success ', () => {
  
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    authenticationRouter(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`POST: ${API_ENDPOINTS.LOGIN} success`, async () => {
    const response = await request(app)
      .post(API_ENDPOINTS.LOGIN)
      .send({ email: 'abc@gmail.com', password: 'AbC@322d7' });

    expect(authenticationController.login).toHaveBeenCalled();
    expect(response.status).toBe(STATUS_CODE.OK);
    expect(response.body.message).toBe(SUCCESSFUL);
  });

  it(`POST: ${API_ENDPOINTS.REGISTER} success`, async () => {
    const response = await request(app)
      .post(API_ENDPOINTS.REGISTER)
      .send({ email: 'abc@gmail.com', password: 'AbC@322d7', username: 'admin', isAdmin: true });

    expect(authenticationController.register).toHaveBeenCalled();
    expect(response.status).toBe(STATUS_CODE.OK);
    expect(response.body.message).toBe(SUCCESSFUL);
  });
});
