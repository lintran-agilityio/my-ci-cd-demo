// libs
import { NextFunction, Request, Response } from 'express';

import { STATUS_CODE, MESSAGES_AUTHENTICATION } from '@/constants';
import { authenticationService } from '@/services';
import {
    generateToken,
    logger,
    toError,
    globalErrorHandler,
} from '@/utils';

class AuthenticationController {

    register = async (req: Request, res: Response, next: NextFunction) => {
        const params = req.body;

        try {
            const hasExistUser = await authenticationService.isValidExistUser(params.email);

            if (hasExistUser) return next(globalErrorHandler(STATUS_CODE.BAD_REQUEST, MESSAGES_AUTHENTICATION.EXIST_USER));

            const dataRes = await authenticationService.create(params);

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
            const dataRes = await authenticationService.login(params);

            if (!dataRes) return next(globalErrorHandler(STATUS_CODE.UNAUTHORIZED, MESSAGES_AUTHENTICATION.INVALID_EMAIL_PASSWORD));

            // generate token
            const token = generateToken.accessToken(dataRes);

            return res.status(STATUS_CODE.OK).json({ data: { ...dataRes, token } });
        } catch (error) {
            const { message } = toError(error);
            logger.error(message);
            
            next(globalErrorHandler(STATUS_CODE.INTERNAL_SERVER_ERROR, message));
        }
    }
}

export const authenticationControler = new AuthenticationController();
