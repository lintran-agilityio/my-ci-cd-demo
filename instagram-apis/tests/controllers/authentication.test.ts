// libs
import 'jest';
import express, { NextFunction, Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

import { sequelize } from "@/configs";
import { authenticationControler } from "@/controllers";
import { authenticationService } from '@/services';
import { API_ENPOINTS, MESSAGES_AUTHENTICATION, STATUS_CODE } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { USER_PAYLOAD, USER_PAYLOAD_LOGIN, LIST_USERS } from '@/mocks';
import { User } from '@/models';

// jest.mock('@/services');
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
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  const payload = {
    username: 'user',
    email: 'user@gmail.com',
    password: 'Abc@12345',
    isAdmin: false
  };
  const newUser = {
    "userId": 11,
    "email": "user@gm.com",
    "username": "user",
    "isAdmin": false,
    "updatedAt": "2025-08-07T11:17:02.280Z",
    "createdAt": "2025-08-07T11:18:56.488Z"
  };
  
  describe('Authentication: User register', () => {
    app.post(API_ENPOINTS.REGISTER, authenticationControler.register);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should user register: create a user', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.REGISTER)
        .send(USER_PAYLOAD);

      expect(response.status).toBe(STATUS_CODE.CREATED);
      expect(response.body.data).toHaveProperty("email", "user@gmail.com");
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('Should return error: user is existed', async () => {
      const response = await request(app)
        .post(API_ENPOINTS.REGISTER)
        .send(USER_PAYLOAD);

      expect(response.status).toBe(STATUS_CODE.CONFLICT);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.EXIST_USER);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(authenticationService, 'create').mockRejectedValue(error);

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
});
