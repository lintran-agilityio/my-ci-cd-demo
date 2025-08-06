// libs
import 'jest';
import { NextFunction, Request, Response } from 'express';

import { userController } from "@/controllers";
import { userServices } from '@/services';
import { MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE, MESSAGES } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { LIST_USERS } from '@/mocks';

jest.mock('@/services');

describe('User controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;
  const { OFFSET, LIMIT } = PAGINATION.DEFAULT;
  const { UPDATE } = MESSAGES.SUCCESS;

  beforeEach(() => {
    req = {
      query: {
        offset: OFFSET.toString(),
        limit: LIMIT.toString(),
      },
      params: {
        userId: '1'
      },
      body: {
        users: LIST_USERS
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Get all Users', () => {
    it('Get Users Success: should return all users', async () => {
      const data = {
        data: LIST_USERS,
        meta: {
          pagination: {
            limit: LIMIT,
            offset: OFFSET
          }
        }
      };

      userServices.getAll = jest.fn().mockResolvedValue(data);
      await userController.getAll(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ data });
    });

    it('Get Users Error: should return INTERNAL_SERVER_ERROR error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );

      userServices.getAll = jest.fn().mockRejectedValue(error);
      await userController.getAll(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Get User by id', () => {
    it('Get User Success: should return user', async () => {
      const data = {
        data: LIST_USERS[0]
      };

      userServices.getUserById = jest.fn().mockResolvedValue(data);
      await userController.getUserById(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ data });
    });

    it('Get User Error: should return INTERNAL_SERVER_ERROR error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );

      userServices.getUserById = jest.fn().mockRejectedValue(error);
      await userController.getAll(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('PUT list Users', () => {
    it('Update list Users Success: should update and return users', async () => {
      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([]);
      (userServices.updateUsers as jest.Mock).mockResolvedValueOnce(LIST_USERS);
      await userController.updateUsers(req as Request, res as Response, next as NextFunction);

      expect(userServices.checkExistingEmails).toHaveBeenCalledWith(LIST_USERS, ["user@gm.com"]);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ data: LIST_USERS, message: UPDATE });
      expect(next).not.toHaveBeenCalled();
    });

    it('Update list Users Error: should return "Duplicate email in user " error', async () => {
      req.body = {
        users: [
          ...LIST_USERS,
          {
            "userId": 1,
            "email": "user@gm.com",
            "username": "Admin",
            "isAdmin": true,
          } 
        ]
      }
      const error = new HttpExeptionError(
        STATUS_CODE.BAD_REQUEST,
        "Duplicate email in user' payload"
      );

      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([]);
      (userServices.updateUsers as jest.Mock).mockResolvedValueOnce(LIST_USERS);
      await userController.updateUsers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('Update list Users Error: should return "Some emails already exist " error', async () => {
      req.body = {
        users: [
          ...LIST_USERS,
          {
            "userId": 1,
            "email": "user1@gm.com",
            "username": "Admin",
            "isAdmin": true,
          } 
        ]
      };

      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([
        {
          userId: 1,
          email: "user@gm.com",
          username: "Admin",
          isAdmin: true,
        },
      ]);
      await userController.updateUsers(req as Request, res as Response, next as NextFunction);
    
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "Some emails already exist",
        data: [
          {
            userId: 1,
            email: "user@gm.com",
            username: "Admin",
            isAdmin: true,
          },
        ],
      });
    
      expect(next).not.toHaveBeenCalled();
    });

    it('Update list Users Error: should return "No found " error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.NOT_FOUND,
        MESSAGES.NOT_FOUND
      );

      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([
        {
          userId: 1,
          email: "user1@gm.com",
          username: "Admin",
          isAdmin: true,
        },
      ]);
      (userServices.updateUsers as jest.Mock).mockResolvedValueOnce([]);
    
      await userController.updateUsers(req as Request, res as Response, next as NextFunction);
    
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});