// libs
import { compare, genSalt, hash } from "bcrypt";

import { User } from "@/models";
import { omitFields } from "@/utils";
import { IUserInfo, IUserLogin, IUserResponse } from "@/types";

class AuthenticationService {
    isValidExistUser = async (email: string) => {
        const user = await User.findOne({ where: { email } });

        return !!user;
    };

    createUser = async (payload: IUserInfo) => {
        const params = { ...payload };

        try {
            const salt = await genSalt(10);
            const hashedPassword = await hash(params.password, salt);

            const user = await User.create({ ...params, password: hashedPassword });

            return omitFields(user.toJSON(), 'password');
        } catch (error) {
            throw error;
        }
    };

    loginUser = async (payload: IUserLogin): Promise<IUserResponse | null> => {
        const params = { ...payload };

        try {
            const user = await User.findOne({ where: { email: params.email } });
            
            if (!user) return null;

            const isValidPassword = await compare(params.password, user.password);
            return isValidPassword ? omitFields(user.toJSON(), 'password') : null;
        } catch (error) {
            throw error;
        }
    }
};

export const authenticationService = new AuthenticationService();
