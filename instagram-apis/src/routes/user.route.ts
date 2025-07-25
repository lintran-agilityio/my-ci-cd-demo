// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { userController } from '@/controllers';

export const userRouter = (app: Application) => {
    app.route(API_ENPOINTS.GET_USERS).get(userController.getUsers);
};
