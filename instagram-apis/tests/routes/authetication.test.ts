// libs
import request from "supertest";
import express, { Application } from "express"

import { authenticationControler } from "@/controllers";
import { authenticationRouter } from "@/routes/authetication.route";
import { API_ENPOINTS, STATUS_CODE, MESSAGES_AUTHENTICATION } from "@/constants";

const { SUCCESSFUL } = MESSAGES_AUTHENTICATION;

jest.mock('@/controllers/authentication.controller', () => ({
  authenticationControler: {
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

  it(`POST: ${API_ENPOINTS.LOGIN} success`, async () => {
    const response = await request(app)
      .post(API_ENPOINTS.LOGIN)
      .send({ email: 'abc@gmail.com', password: 'AbC@322d7' });

    expect(authenticationControler.login).toHaveBeenCalled();
    expect(response.status).toBe(STATUS_CODE.OK);
    expect(response.body.message).toBe(SUCCESSFUL);
  });

  it(`POST: ${API_ENPOINTS.REGISTER} success`, async () => {
    const response = await request(app)
      .post(API_ENPOINTS.REGISTER)
      .send({ email: 'abc@gmail.com', password: 'AbC@322d7', username: 'admin', isAdmin: true });

    expect(authenticationControler.register).toHaveBeenCalled();
    expect(response.status).toBe(STATUS_CODE.OK);
    expect(response.body.message).toBe(SUCCESSFUL);
  });
});
