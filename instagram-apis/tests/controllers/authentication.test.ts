// libs
import 'jest';
import express, { NextFunction, Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

import { sequelize } from "@/configs";
import { authenticationControler } from "@/controllers";
import { API_ENPOINTS, MESSAGES_AUTHENTICATION, STATUS_CODE } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { USER_PAYLOAD, USER_PAYLOAD_LOGIN } from '@/mocks';
import { User } from '@/models';

const app: Express = express();
app.use(bodyParser.json());

describe('Authentication controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(() => {
    req = {
      body: {
        username: 'user',
        email: 'test@gmail.com',
        password: 'Abc@123456',
        isAdmin: false
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }

    next = jest.fn();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await sequelize.close();
  });
  
  describe('Authentication: User register', () => {
    app.post(API_ENPOINTS.REGISTER, authenticationControler.register);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should user register: create a user', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.REGISTER)
        .send({ ...USER_PAYLOAD, email: 'usera@gmail.com' });

      expect(response.status).toBe(STATUS_CODE.CREATED);
      expect(response.body.data).toHaveProperty("email", "usera@gmail.com");
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('Should return error: user is existed', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.REGISTER)
        .send({ ...USER_PAYLOAD, email: 'usera@gmail.com' });

      expect(response.status).toBe(STATUS_CODE.CONFLICT);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.EXIST_USER);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'create').mockRejectedValue(error);

      const response = await request(app)
        .post(API_ENPOINTS.REGISTER)
        .send({
          username: 'user1',
          email: 'user1@gmail.com',
          password: 'Abc@12345',
          isAdmin: false
        });

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Authentication: User login', () => {
    app.post(API_ENPOINTS.LOGIN, authenticationControler.login);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should user login: user login', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.LOGIN)
        .send(USER_PAYLOAD_LOGIN);

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data).toHaveProperty("email", "usera@gmail.com");
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('Should return error: user is existed', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.LOGIN)
        .send({
          ...USER_PAYLOAD,
          email: 'user1@gmail.com'
        });

      expect(response.status).toBe(STATUS_CODE.UNAUTHORIZED);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INVALID_EMAIL_PASSWORD);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'findOne').mockRejectedValue(error);

      const response = await request(app)
        .post(API_ENPOINTS.LOGIN)
        .send(USER_PAYLOAD_LOGIN);

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });
});
