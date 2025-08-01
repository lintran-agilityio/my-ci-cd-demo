// libs
import { Application } from 'express';

import { authenticationRouter } from './authetication.route';
import { userRouter } from './user.route';
import { postsRouter } from './posts.route';
import { commentsRouter } from './comments.route';

const routes = (app: Application) => {
    authenticationRouter(app);
    userRouter(app);
    postsRouter(app);
    commentsRouter(app);
};

export default routes;
