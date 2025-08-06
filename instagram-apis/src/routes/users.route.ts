// libs
import { Application } from 'express';

import { API_ENPOINTS } from '@/constants';
import { userController } from '@/controllers';
import { userUpdateSchema, userSchema, usersUpdateSchema } from '@/validation';
import { validateRequest } from '@/middlewares/validate-request.middleware';

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
   *                   useId:
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
  app.get(API_ENPOINTS.USERS, userController.getAll);

  /**
   * @openapi
   * /api/v1/users/{userId}:
   *   get:
   *     summary: Get user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: userId
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
  app.get(API_ENPOINTS.USER_BY_ID, validateRequest(userSchema, 'params'), userController.getUserById);

  /**
   * @openapi
   * /api/v1/users/{userId}:
   *   put:
   *     summary: Update user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: userId
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
  app.put(API_ENPOINTS.USER_BY_ID, validateRequest(userUpdateSchema, 'body'), userController.updateUserById);

  /**
   * @api {put} /api/v1/users Update multiple users
   * @apiName UpdateUsers
   * @apiGroup Users
   * @apiVersion 1.0.0
   *
   * @apiDescription Update multiple user records by their userId. All fields are optional except userId.
   *
   * @apiBody {Object[]} users List of users to update
   * @apiBody {Number} users.userId User's unique ID (required)
   * @apiBody {String} [users.email] Email address
   * @apiBody {String} [users.username] Username
   * @apiBody {Boolean} [users.isAdmin] Whether the user is admin
   *
   * @apiExample {json} Request Body
   * [
   *   {
   *     "userId": 1,
   *     "email": "newemail@example.com",
   *     "username": "newusername",
   *     "isAdmin": true
   *   },
   *   {
   *     "userId": 2,
   *     "email": "another@example.com"
   *   }
   * ]
   *
   * @apiSuccess {Object[]} data Updated user records
   * @apiSuccessExample {json} Success Response
   * HTTP/1.1 200 OK
   * {
   *   "data": [
   *     {
   *       "userId": 1,
   *       "email": "newemail@example.com",
   *       "username": "newusername",
   *       "isAdmin": true,
   *       "updatedAt": "2025-08-05T10:30:00.000Z"
   *     },
   *     ...
   *   ]
   * }
   *
   * @apiError (400) BadRequest Invalid request body format or missing required fields
   * @apiError (500) InternalServerError Server error
   */
  app.put(API_ENPOINTS.USERS, validateRequest(usersUpdateSchema, 'body'), userController.updateUsers);

  /**
   * @api {delete} /api/v1/users Delete multiple users
   * @apiName DeleteUsers
   * @apiGroup Users
   * @apiVersion 1.0.0
   *
   * @apiDescription Delete multiple users by their userId.
   *
   * @apiBody {Number[]} userIds List of user IDs to delete
   *
   * @apiExample {json} Request Body
   * {
   *   "userIds": [1, 2, 3]
   * }
   *
   * @apiSuccess {String} message Deletion confirmation message
   * @apiSuccessExample {json} Success Response
   * HTTP/1.1 200 OK
   * {
   *   "message": "Users deleted successfully"
   * }
   *
   * @apiError (500) InternalServerError Server error
   */
  app.delete(API_ENPOINTS.USERS, userController.deleteUsers);

  /**
   * @openapi
   * /api/v1/users/{userId}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [User Controller]
   *     parameters:
   *       - in: path
   *         name: userId
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
  app.delete(API_ENPOINTS.USER_BY_ID, userController.deleteUserById)
};
