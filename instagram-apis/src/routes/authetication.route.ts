// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { authenticationControler } from '@/controllers';

export const authenticationRouter = (app: Application) => {
    app.route(API_ENPOINTS.REGISTER).post(authenticationControler.register);
    app.route(API_ENPOINTS.LOGIN).get(authenticationControler.login);
};
