// libs
import { compare, genSalt, hash } from "bcrypt";

import { User } from "@/models";
import { omitField } from "@/utils";
import { IUserInfo, IUserLogin, IUserResponse } from "@/types";

class AuthenticationService {
  isValidExistUser = async (email: string) => {
    const user = await User.findOne({ where: { email } });
    return !!user;
  };

  create = async (payload: IUserInfo) => {
    try {
      const salt = await genSalt(10);
      const hashedPassword = await hash(payload.password, salt);
      const user = await User.create({ ...payload, password: hashedPassword });

      return omitField(user.toJSON(), 'password');
    } catch (error) {
      throw error;
    }
  };

  login = async (payload: IUserLogin): Promise<IUserResponse | null> => {
    const { email, password } = payload;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;
      const userData = user.toJSON();
      const isValidPassword = await compare(password, userData.password);

      return isValidPassword ? omitField(user.toJSON(), 'password') : null;
    } catch (error) {
      throw error;
    }
  }
};

export const authenticationService = new AuthenticationService();
