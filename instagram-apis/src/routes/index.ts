// libs
import { Application } from 'express';

import { authenticationRouter } from './authetication.route';
import { userRouter } from './user.route';
import { postsRouter } from './posts.route';

const routes = (app: Application) => {
    authenticationRouter(app);
    userRouter(app);
    postsRouter(app);
};

export default routes;
