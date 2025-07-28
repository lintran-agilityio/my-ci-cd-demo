// libs
import { NextFunction, Request, Response } from 'express';

import { STATUS_CODE, MESSAGES_AUTHENTICATION } from '@/constants';
import { authenticationService } from '@/services';
import {
    generateToken,
    logger,
    toError,
    globalErrorHandler,
    loginSchema,
    registerSchema
} from '@/utils';
import { validateRequestBody } from '@/middlewares/validate';

class AuthenticationController {

    register = async (req: Request, res: Response, next: NextFunction) => {
        const params = req.body;

        try {
            const errors = validateRequestBody(registerSchema, req);

            if (errors) return res.status(STATUS_CODE.BAD_REQUEST).json({ errors });

            const hasExistUser = await authenticationService.isValidExistUser(params.email);

            if (hasExistUser) return next(globalErrorHandler(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.EXIST_USER));

            const dataRes = await authenticationService.createUser(params);

            return res.status(STATUS_CODE.CREATED).json({ data: dataRes });
        } catch (error) {
            const { message } = toError(error);
            logger.error(message);
            next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        const params = req.body;

        try {
            const errors = validateRequestBody(loginSchema, req);

            if (errors) return res.status(STATUS_CODE.BAD_REQUEST).json({ errors });

            const dataRes = await authenticationService.loginUser(params);

            if (!dataRes) return next(globalErrorHandler(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.INVALID_EMAIL_PASSWORD));

            // generate token
            const token = generateToken(dataRes);

            return res.status(STATUS_CODE.OK).json({ data: { ...dataRes, token } });
        } catch (error) {
            const { message } = toError(error);
            logger.error(message);
            next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
        }
    }
}

export const authenticationControler = new AuthenticationController();
