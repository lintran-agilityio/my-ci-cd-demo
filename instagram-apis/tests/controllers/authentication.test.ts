// libs
import 'jest';
import { NextFunction, Request, Response } from 'express';

import { authenticationControler } from "@/controllers";
import { authenticationService } from '@/services';
import { MESSAGES_AUTHENTICATION, STATUS_CODE } from '@/constants';
import HttpExeptionError from '@/exceptions';
import { USER_PAYLOAD, USER_PAYLOAD_LOGIN, LIST_USERS } from '@/mocks';

jest.mock('@/services');

describe('Authentication controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: Partial<NextFunction>;

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

  afterEach(() => {
    jest.clearAllMocks();
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
    "updatedAt": "2025-08-06T08:19:59.636Z",
    "createdAt": "2025-08-06T08:19:59.636Z"
  };
  
  describe('Authentication: User register', () => {
    it('Should user register: create a user', async () => {
      req.body = USER_PAYLOAD;

      (authenticationService.create as jest.Mock).mockResolvedValue(newUser);
      await authenticationControler.register(req as Request, res as Response, next as NextFunction);

      expect(authenticationService.create).toHaveBeenCalledWith(USER_PAYLOAD);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.CREATED);
      expect(res.json).toHaveBeenCalledWith({ data: newUser });
    });

    it('Should return error: user is existed', async () => {
      req.body = USER_PAYLOAD;
      (authenticationService.isValidExistUser as jest.Mock).mockResolvedValue(true);
      await authenticationControler.register(req as Request, res as Response, next as NextFunction);
  
      expect(authenticationService.isValidExistUser).toHaveBeenCalledWith(USER_PAYLOAD.email);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: STATUS_CODE.CONFLICT,
          message: MESSAGES_AUTHENTICATION.EXIST_USER
        })
      );
    });
  
    it('Should return error: server error', async () => {
      req.body = USER_PAYLOAD;
      const error = new HttpExeptionError(
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
      );
  
      (authenticationService.isValidExistUser as jest.Mock).mockResolvedValue(false);
      (authenticationService.create as jest.Mock).mockRejectedValue(error);
      await authenticationControler.register(req as Request, res as Response, next as NextFunction);
  
      expect(authenticationService.create).toHaveBeenCalledWith(USER_PAYLOAD);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Authentication: User login', () => {
    it('Should user login: login a user', async () => {
      const payloadLogin = {
        email: 'user@gmail.com',
        password: 'Abc@12345'
      };
      req.body = payloadLogin;

      (authenticationService.login as jest.Mock).mockResolvedValue(newUser);
      await authenticationControler.login(req as Request, res as Response, next as NextFunction);

      expect(authenticationService.login).toHaveBeenCalledWith(payloadLogin);
      expect(res.status).toHaveBeenCalledWith(STATUS_CODE.OK);
    });

    it('Should error login: invalid email and password', async () => {
      req.body = USER_PAYLOAD_LOGIN;
      const error = new HttpExeptionError(
        STATUS_CODE.UNAUTHORIZED,
        MESSAGES_AUTHENTICATION.INVALID_EMAIL_PASSWORD
      );

      (authenticationService.login as jest.Mock).mockResolvedValue(null);
      await authenticationControler.login(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  it('Should return error login: server error', async () => {
    req.body = USER_PAYLOAD_LOGIN;
    const error = new HttpExeptionError(
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR
    );

    (authenticationService.login as jest.Mock).mockRejectedValue(error);
    await authenticationControler.login(req as Request, res as Response, next as NextFunction);

    expect(authenticationService.login).toHaveBeenCalledWith(USER_PAYLOAD_LOGIN);
    expect(next).toHaveBeenCalledWith(error);
  });
});
