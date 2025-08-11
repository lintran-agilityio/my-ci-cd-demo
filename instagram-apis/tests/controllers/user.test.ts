// libs
import 'jest';
import express, { NextFunction, Request, Response, Express } from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';

import { sequelize } from "@/configs";
import { userController } from "@/controllers";
import { API_ENDPOINTS, MESSAGES_AUTHENTICATION, STATUS_CODE, PAGINATION, MESSAGES } from '@/constants';
import HttpExceptionError from '@/exceptions';
import { USER_PAYLOAD, LIST_USERS } from '@/mocks';
import { User } from '@/models';
import { findAllData } from '@/utils';
import { userServices } from '@/services';

jest.mock('@/utils', () => ({
  ...jest.requireActual('@/utils'),
  findAllData: jest.fn()
}));

const app: Express = express();
app.use(bodyParser.json());

const { DEFAULT: { LIMIT, OFFSET } } = PAGINATION;

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
    app.get(API_ENDPOINTS.USERS, userController.getAll);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should get all users: get users', async () => {
      (findAllData as jest.Mock).mockResolvedValue({
        count: LIST_USERS.length,
        rows: LIST_USERS
      } as any);

      const response = await request(app)
        .get(API_ENDPOINTS.USERS)
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
      
      const error = new HttpExceptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (findAllData as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .get(API_ENDPOINTS.USERS)
        .query({
          limit: LIMIT,
          offset: OFFSET
        });

        expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
        expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: get user by id ', () => {
    app.get(`${API_ENDPOINTS.USERS}/:userId`, userController.getUserById);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });
    it.skip('Should get user by id: get user', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue({
        ...LIST_USERS[0],
        userId: seededUserId
      } as any);
      const response = await request(app)
        .get(`${API_ENDPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.data).toHaveProperty("email", "user@gm.com");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it.skip('Should return error: user not found', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue({
        ...LIST_USERS[0],
        userId: seededUserId
      } as any);
      const response = await request(app)
        .get(`${API_ENDPOINTS.USERS}/9999`);

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.USER_NOT_FOUND);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExceptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'findByPk').mockRejectedValue(error);

      const response = await request(app)
        .get(`${API_ENDPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: update list users ', () => {
    app.put(`${API_ENDPOINTS.USERS}`, userController.updateUsers);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });
    it('Should update list users', async () => {
      const newEmail = 'testUpdate@gmail.com';
      jest.spyOn(User, 'update').mockResolvedValue([1] as any);
      const response = await request(app)
        .put(API_ENDPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, userId: seededUserId, email: newEmail },
          ]
        });

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.message).toBe(MESSAGES.SUCCESS.UPDATE);
      expect(response.body.data[0]).toHaveProperty("email", "user@gmail.com");
    });

    it('Should return error: duplicate email in payload', async () => {
      const response = await request(app)
        .put(API_ENDPOINTS.USERS)
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
      const users = User.findAll({
        where: {}
      });
      console.log("users", users);
      jest.spyOn(User, "findAll").mockResolvedValueOnce([
        {
          ...LIST_USERS[0],
          email: "testUpdate@gmail.com"
        }
      ] as any);
      const response = await request(app)
        .put(API_ENDPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, email: "testUpdate@gmail.com", userId: 2 }
          ]
        });
      expect(response.status).toBe(STATUS_CODE.BAD_REQUEST);
      expect(response.body.message).toBe("Some emails already exist");
    });

    it('Should return error: server error', async () => {
      const error = new HttpExceptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(User, 'update').mockRejectedValue(error);

      const response = await request(app)
        .put(API_ENDPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, userId: seededUserId }
          ]
        });

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });

    it('Should return error: no users found', async () => {
      jest.spyOn(User, 'update').mockResolvedValue([0] as any);
      const response = await request(app)
        .put(API_ENDPOINTS.USERS)
        .send({
          users: [
            { ...USER_PAYLOAD, userId: seededUserId }
          ]
        });

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(MESSAGES.NOT_FOUND);
    });
  });
  
  describe('Users: delete users', () => {
    app.delete(API_ENDPOINTS.USERS, userController.deleteUsers);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should delete all users', async () => {
      jest.spyOn(User, 'destroy').mockResolvedValue(1 as any);
      const response = await request(app)
        .delete(API_ENDPOINTS.USERS);

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.message).toBe(MESSAGES.SUCCESS.DELETE);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExceptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(userServices, 'deleteUsers').mockRejectedValue(error);

      const response = await request(app)
        .delete(API_ENDPOINTS.USERS);

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Users: delete user by id', () => {
    app.delete(`${API_ENDPOINTS.USERS}/:userId`, userController.deleteUserById);

    // Middleware handle error
    app.use((err: HttpExceptionError, _req: Request, res: Response, _next: NextFunction) => {
      res.status(err.status || 500).json({ message: err.message });
    });

    it('Should delete user by id', async () => {
      jest.spyOn(User, 'destroy').mockResolvedValue(1 as any);
      const response = await request(app)
        .delete(`${API_ENDPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.OK);
      expect(response.body.message).toBe(MESSAGES.SUCCESS.DELETE);
    });

    it('Should return error: user not found', async () => {
      jest.spyOn(User, 'destroy').mockResolvedValue(0 as any);
      const response = await request(app)
        .delete(`${API_ENDPOINTS.USERS}/9999`);

      expect(response.status).toBe(STATUS_CODE.NOT_FOUND);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.USER_NOT_FOUND);
    });

    it('Should return error: server error', async () => {
      const error = new HttpExceptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      jest.spyOn(userServices, 'deleteUserById').mockRejectedValue(error);

      const response = await request(app)
        .delete(`${API_ENDPOINTS.USERS}/${seededUserId}`);

      expect(response.status).toBe(STATUS_CODE.INTERNAL_SERVER_ERROR);
      expect(response.body.message).toBe(MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR);
    });
  });
});
