// libs
import { Application } from 'express';

import { authenticationRouter } from './authetication.route';
import { userRouter } from './user.route';
import { apiDocsRouter } from './api-doc.route';

const routes = (app: Application) => {
    authenticationRouter(app);
    userRouter(app)
};

export default routes;
