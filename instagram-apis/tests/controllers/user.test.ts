// libs
import 'jest';
import express, { NextFunction, Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

import { sequelize } from "@/configs";
import { authenticationControler, userController } from "@/controllers";
import { API_ENPOINTS, MESSAGES_AUTHENTICATION, STATUS_CODE, PAGINATION, MESSAGES } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { USER_PAYLOAD, USER_PAYLOAD_LOGIN, MOCK_USERS_RESPONSE, LIST_USERS } from '@/mocks';
import { User } from '@/models';
import { findAllData } from '@/utils';
import { RequestAuthenType } from '@/types';
import { validateToken } from '@/middlewares/validate-token.middleware';

const app: Express = express();
app.use(bodyParser.json());

const { DEFAULT: { LIMIT, OFFSET } } = PAGINATION;

jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  findAllData: jest.fn()
}));

jest.mock('@/middlewares/validate-token.middleware', () => ({
  validateToken: (req: RequestAuthenType, res: Response, next: NextFunction) => {
    req.userId = 1
    req.isAdmin = true;
    next();
  }
}));

describe('Users controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  let seededUserId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const user = await User.create({ ...USER_PAYLOAD, isAdmin: true });

    seededUserId = user.userId;
  });

  beforeEach(() => {
    req = {
      body: USER_PAYLOAD
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
  
  describe('Users: get all users', () => {
    app.get(API_ENPOINTS.USERS, userController.getAll);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should get all users: get users', async () => {
      (findAllData as jest.Mock).mockResolvedValue({
        count: LIST_USERS.length,
        rows: LIST_USERS
      } as any);

      const response = await request(app)
        .get(API_ENPOINTS.USERS)
        .query({
          limit: LIMIT,
          offset: OFFSET
        });
console.log('response', response.body.data);
      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data?.rows[0]).toHaveProperty("email", "user@gm.com");
      expect(response.body.data?.rows[0]).not.toHaveProperty("password");
    });

    it('Should return error: no users found', async () => {
      
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (findAllData as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .get(API_ENPOINTS.USERS)
        .query({
          limit: LIMIT,
          offset: OFFSET
        });

        expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
        expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: get user by id ', () => {
    app.get(`${API_ENPOINTS.USERS}/:userId`, userController.getUserById);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });
    it('Should get user by id: get user', async () => {
      const response = await request(app)
        .get(`${API_ENPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data).toHaveProperty("email", "user@gmail.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it('Should return error: user not found', async () => {
      const response = await request(app)
        .get(`${API_ENPOINTS.USERS}/9999`);

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.USER_NOT_FOUND);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'findByPk').mockRejectedValue(error);

      const response = await request(app)
        .get(`${API_ENPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: update list users ', () => {
    app.put(`${API_ENPOINTS.USERS}`, validateToken, userController.updateUsers);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });
    it('Should update list users', async () => {
      const newEmail = 'testUpdate@gmail.com';
      const response = await request(app)
        .put(API_ENPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, userId: seededUserId, email: newEmail },
          ]
        });

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.message).toBe(MESSAGES.SUCCESS.UPDATE);
      expect(response.body.data[0]).toHaveProperty("email", newEmail);
    });

    it('Should return error: duplicate email in payload', async () => {
      const response = await request(app)
        .put(API_ENPOINTS.USERS)
        .send({
          users: [
            USER_PAYLOAD,
            USER_PAYLOAD
          ]
        });
      expect(response.status).toBe(STATUS_CODE.BAD_REQUEST);
      expect(response.body.message).toBe("Duplicate email in user' payload");
    });

    it('Should return error: duplicate email in data', async () => {
      const response = await request(app)
        .put(API_ENPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, email: "testUpdate@gmail.com", userId: 2 }
          ]
        });
      expect(response.status).toBe(STATUS_CODE.BAD_REQUEST);
      expect(response.body.message).toBe("Some emails already exist");
    });

    it('Should return error: server error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'update').mockRejectedValue(error);

      const response = await request(app)
        .put(API_ENPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, userId: seededUserId }
          ]
        });

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: update user by id ', () => {
    app.put(`${API_ENPOINTS.USERS}/:userId`, userController.updateUserById);

    // Middleware handle error
    app.use((err: HttpExeptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should update user by id', async () => {
      const data = await User.findAndCountAll({
        where: { }
      })
      console.log("allllll=>", data.rows)
      const newEmail = 'updateTest@gmail.com';
      console.log("seededUserId", seededUserId);
      const token = 'fake-or-real-jwt';
      const response = await request(app)
        .put(`${API_ENPOINTS.USERS}/${seededUserId}`)
        .send({
          username: 'updatedUser',
          email: newEmail,
          isAdmin: true
        });
      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.message).toBe(MESSAGES.SUCCESS.UPDATE);
      expect(response.body.data).toHaveProperty("email", newEmail); // Updated email
      expect(response.body.data).not.toHaveProperty("password");  // Password should not be returned 
      expect(response.body.data).toHaveProperty("userId", seededUserId); // User ID should remain the same
    });
  });
});
