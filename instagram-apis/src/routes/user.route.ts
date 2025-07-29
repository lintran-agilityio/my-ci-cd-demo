// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { userController } from '@/controllers';
import { updateUserDetailSchema, userDetailSchema } from '@/validation';
import { validateRequest } from '@/middlewares/validate-middleware';

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
  app.get(API_ENPOINTS.USERS, userController.getAll)

  /**
   * @openapi
   * /api/v1/users/{user_id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 username:
   *                   type: string
   *                   example: abc
   *                 email:
   *                   type: string
   *                   example: test@gmail.com
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  app.get(API_ENPOINTS.USER_DETAIL, validateRequest(userDetailSchema, 'params'), userController.getUserById);

  /**
   * @openapi
   * /api/v1/users/{user_id}:
   *   put:
   *     summary: Update user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 example: newusername
   *               email:
   *                 type: string
   *                 example: newemail@gmail.com
   *     responses:
   *       200:
   *         description: User updated successfully
   *       404:
   *         description: User not found
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  app.put(API_ENPOINTS.USER_DETAIL, validateRequest(updateUserDetailSchema, 'body'), (req, res, next) => {
      userController.updateUserById(req, res, next);
  });

  /**
   * @openapi
   * /api/v1/users/{user_id}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: user_id
   *         required: true
   *         schema:
   *           type: integer
   *         description: The user ID
   *     responses:
   *       200:
   *         description: User deleted successfully
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  app.delete(API_ENPOINTS.USER_DETAIL, userController.deleteUserById)
};
