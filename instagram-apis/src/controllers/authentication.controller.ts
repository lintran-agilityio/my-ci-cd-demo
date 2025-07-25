// libs
import { Request, Response } from 'express';

import { STATUS_CODE, MESSAGES_AUTHENTICATION } from '@/constants';
import { validateRegisterUser, validateLoginUser, generateToken } from '@/utils';
import { authenticationService } from '@/services';

class AuthenticationController {

    async register(req: Request, res: Response) {
        const params = req.body;

        try {
            const errors = validateRegisterUser(params);

            if (errors.length > 0) return res.status(STATUS_CODE.BAD_REQUEST).json({ errors });
            const hasExistUser = await authenticationService.isValidExistUser(params.email);

            if (hasExistUser) return res.status(STATUS_CODE.BAD_REQUEST).json({ error: MESSAGES_AUTHENTICATION.EXIST_USER });

            const dataRes = await authenticationService.createUser(params);

            return res.status(STATUS_CODE.CREATED).json({ data: dataRes });
        } catch (error) {
            return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error });
        }
    }

    async login(req: Request, res: Response) {
        const params = req.body;

        try {
            const errors = validateLoginUser(params);

            if (errors.length > 0) return res.status(STATUS_CODE.BAD_REQUEST).json({ errors });

            const dataRes = await authenticationService.loginUser(params);
            if (!dataRes) return res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES_AUTHENTICATION.INVALID_EMAIL_PASSWORD });

            // generate token
            const token = generateToken(dataRes);

            return res.status(STATUS_CODE.OK).json({ data: { ...dataRes, token } });
        } catch (error) {
            return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: MESSAGES_AUTHENTICATION.INTERNAL_SERVER_ERROR });
        }
    }
}

export const authenticationControler = new AuthenticationController();
