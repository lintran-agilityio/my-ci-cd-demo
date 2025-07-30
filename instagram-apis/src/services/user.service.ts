import { User } from "@/models";
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
    const res = await User.update(
      { username, email, isAdmin },
      {
        where: { userId }
      }
    );

    return res[0];
  };

  deleteUserById = async (userId: number) => {
    return await User.destroy({ where: { userId }});
  }
};

export const userServices = new UserServices();
