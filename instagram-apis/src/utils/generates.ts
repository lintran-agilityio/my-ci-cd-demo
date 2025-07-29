import jwt from "jwt-simple";

import { IUserResponse } from "@/types";
import { JWT_SECRET, EXPIRES_TIME, REFRESH_EXPIRES_TIME, REFRESH_TOKEN_SECRET } from "@/constants";
import { configLogger } from "@/configs";

export const generateToken = {
    accessToken: (user: IUserResponse) => {
        const { user_id, email, username } = user;
    
        return jwt.encode(
            { user_id, email, username, exp:  EXPIRES_TIME },
            JWT_SECRET || configLogger.params.jwtSecret) || '';
    },

    refreshToken: (user: IUserResponse) => {
        const { user_id, email } = user;
        const refereshPayload = {
            sub: user_id,
            type: 'refresh',
            exp: REFRESH_EXPIRES_TIME
        };

        return jwt.encode(refereshPayload, REFRESH_TOKEN_SECRET);
    }
};
