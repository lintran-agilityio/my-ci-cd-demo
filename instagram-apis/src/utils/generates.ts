import jwt from "jwt-simple";

import { IUserResponse } from "@/types";
import { JWT_SECRET } from "@/constants";
import { configLogger } from "@/configs";

export const generateToken = (user: IUserResponse) => {
    const { user_id, email } = user;

    return jwt.encode({ user_id, email }, JWT_SECRET || configLogger.params.jwtSecret) || '';
};