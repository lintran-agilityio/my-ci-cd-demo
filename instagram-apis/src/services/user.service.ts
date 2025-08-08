// libs
import { Op } from "sequelize";

import { Comment, Post, User } from "@/models";
import { IUser } from "@/types";
import { findAllData, omitField } from "@/utils";

class UserServices {
  getAll = async (offset: number, limit: number) => {
    try {
      return findAllData({
        model: User,
        offset,
        limit,
        order: ['createdAt', 'DESC'],
        fieldOmit: "password"
      });
    } catch (error) {
      throw error;
    }
  };

  getUserById = async (userId: number) => {
    try {
      const res = await User.findByPk(userId);
      return res ? omitField(res.toJSON(), 'password') : null;
    } catch (error) {
      throw error;
    }
  };

  updateUserById = async (userId: number, username: string, email: string, isAdmin: boolean) => {

    try {
      const res = await User.update(
        { username, email, isAdmin },
        { where: { userId } }
      );

      return res[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  checkExistingEmail = async (userId: number, email: string) => {
    try {
      return await User.findOne({
        where: {
          email,
          userId: { [Op.ne]: userId }, // id khác user đang update
        },
      });
    } catch (error: unknown) {
      throw error
    }
  };

  checkExistingEmails = async (users: IUser[], userEmails: string[]) => {
    try {
      if (userEmails.length === 0) return [];

      const existingEmailData = await User.findAll({
        where: {
          email: { [Op.in]: userEmails }
        },
        attributes: ["userId", "email"]
      });

      const conflictEmail = [];

      for (const user of users) {
        for (const dataUser of existingEmailData) {
          if (dataUser.email === user.email && dataUser.userId !== user.userId) {
            conflictEmail.push({ email: user.email, userId: dataUser.userId });
          }
        }
      }

      return conflictEmail;
    } catch (error: unknown) {
      throw error;
    }
  };

  updateUsers = async(usersUpdate: IUser[]) => {
    try {
      const usersUpdated: IUser[] = [];

      for (const userData of usersUpdate) {
        const {
          userId,
          email,
          username,
          isAdmin
        } = userData;

        const [count] = await User.update(
          {
            email,
            username,
            isAdmin
          },
          { where: { userId } }
        );
        
        if (count > 0) {
          const userUpdated = await User.findOne({ where: { userId }});

          if (userUpdated) usersUpdated.push(userUpdated);
        }
      }

      return usersUpdated;
    } catch (error: unknown) {
      throw error;
    }
  };

  deleteUsers = async () => {
    try {

      // Delete all table have foreignKey by authorId
      await Comment.destroy({
        where: {}
      });
      await Post.destroy({
        where: {}
      });

      return await User.destroy({
        where: {},
        individualHooks: true
      })
    } catch (error: unknown) {
      throw error;
    }
  };

  deleteUserById = async (userId: number) => {
    try {
      return await User.destroy({ where: { userId }});
    } catch (error: unknown) {
      throw error;
    }
  }
};

export const userServices = new UserServices();
