// libs
import 'jest';
import { NextFunction, Request, Response } from 'express';

import { userController } from "@/controllers";
import { userServices } from '@/services';
import { MESSAGES_AUTHENTICATION, PAGINATION, STATUS_CODE, MESSAGES } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { LIST_USERS, MOCKS_POSTS } from '@/mocks';

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
    (userServices.checkExistingEmails as jest.Mock).mockReset();
    (userServices.updateUsers as jest.Mock).mockReset();
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
      const reqMock: Partial<Request> = {
        body: {
          users: [
            ...LIST_USERS,
            {
              "userId": 1,
              "email": "user1@gm.com",
              "username": "Admin",
              "isAdmin": true,
            } 
          ]
        }
      };

      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([
        {
          userId: 1,
          email: "user@gm.com",
          username: "Admin",
          isAdmin: true,
        },
      ]);
      await userController.updateUsers(reqMock as Request, res as Response, next as NextFunction);
    
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
      const error = new HttpExeptionError(
        STATUS_CODE.NOT_FOUND,
        MESSAGES.NOT_FOUND
      );

      (userServices.checkExistingEmails as jest.Mock).mockResolvedValueOnce([]);
      (userServices.updateUsers as jest.Mock).mockResolvedValueOnce([]);
    
      await userController.updateUsers(req as Request, res as Response, next as NextFunction);
    
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('PUT User by id: update a user by userId', () => {
    const payload = {
      username: "Admin",
      email: "abc@gmail.com",
      isAdmin: true
    };
    it('Update User Success: should update and return user', async () => {
      req = {
        params: { userId: '1' },
        body: payload
      };

      (userServices.checkExistingEmail as jest.Mock).mockResolvedValueOnce([]);
      (userServices.updateUserById as jest.Mock).mockResolvedValueOnce(LIST_USERS[0]);
      await userController.updateUserById(req as Request, res as Response, next as NextFunction);

      expect(userServices.updateUserById).toHaveBeenCalledWith(1, "Admin", "abc@gmail.com", true);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ messgae: UPDATE });
    });

    it('Update User by Id Error: should return "Email exist" error', async () => {
      req = {
        params: { userId: '1' },
        body: payload
      };

      const error = new HttpExeptionError(
        STATUS_CODE.BAD_REQUEST,
        `Email ${payload.email} existing`
      );

      (userServices.checkExistingEmail as jest.Mock).mockResolvedValueOnce({ userId: 1, ...payload});
      await userController.updateUserById(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('Update User by Id Error: should return "User not found" error', async () => {
      req = {
        params: { userId: '1' },
        body: payload
      };

      const error = new HttpExeptionError(
        STATUS_CODE.BAD_REQUEST,
        MESSAGES_AUTHENTICATION.USER_NOT_FOUND
      );

      (userServices.checkExistingEmail as jest.Mock).mockResolvedValueOnce({});
      (userServices.updateUserById as jest.Mock).mockResolvedValueOnce(0);

      await userController.updateUserById(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('Update User by Id Error: should return "Authentication faild" error', async () => {
      req = {
        params: { userId: '1' },
        body: payload
      };

      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );

      (userServices.checkExistingEmail as jest.Mock).mockResolvedValueOnce({});
      (userServices.updateUserById as jest.Mock).mockRejectedValue(error);

      await userController.updateUserById(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Delete Users: delete a user by userId', () => {
    it('Delete Users: delete all users success', async () => {
      (userServices.deleteUsers as jest.Mock).mockResolvedValueOnce(1);
      await userController.deleteUsers(req as Request, res as Response, next as NextFunction);

      expect(userServices.deleteUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ message: MESSAGES.SUCCESS.DELETE });
    });

    it('Delete Users: should return "Authentication faild" error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (userServices.deleteUsers as jest.Mock).mockRejectedValue(error);
      await userController.deleteUsers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Delete User by id: delete a user by userId', () => {
    it('Delete User: delete user by id success', async () => {
      req.params = { userId: '1' };
      (userServices.deleteUserById as jest.Mock).mockResolvedValueOnce(1);
      await userController.deleteUserById(req as Request, res as Response, next as NextFunction);

      expect(userServices.deleteUserById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
      expect(res.json).toHaveBeenCalledWith({ message: MESSAGES.SUCCESS.DELETE });
    });

    it('Delete User: delete user by id success', async () => {
      req.params = { userId: '1' };
      const error = new HttpExeptionError(
        STATUS_CODE.BAD_REQUEST,
        MESSAGES_AUTHENTICATION.USER_NOT_FOUND
      );

      (userServices.deleteUserById as jest.Mock).mockResolvedValueOnce(0);
      await userController.deleteUserById(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('Delete User by id: should return "Authentication faild" error', async () => {
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
      (userServices.deleteUsers as jest.Mock).mockRejectedValue(error);
      await userController.deleteUsers(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});