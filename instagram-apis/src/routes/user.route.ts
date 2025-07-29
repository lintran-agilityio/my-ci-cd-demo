// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { userController } from '@/controllers';

export const userRouter = (app: Application) => {
    /**
     * @openapi
     * /api/v1/users:
     *   get:
     *     summary: Get all users
     *     tags: [User Controller]
     *     responses:
     *       200:
     *         description: List of users retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     example: 1
     *                   username:
     *                     type: string
     *                     example: abc
     *                   email:
     *                     type: string
     *                     example: test@gmail.com
     *       500:
     *         description: Internal server error
     */
    app.route(API_ENPOINTS.USERS).get(userController.getUsers);
};
