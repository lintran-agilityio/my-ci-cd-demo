import { User } from "@/models";
import { omitFields } from "@/utils";

class UserServices {
    getUsers = async (offset: number, limitNumber: number) => {
        try {
            const users = await User.findAndCountAll({
                limit: limitNumber,
                offset,
                order: [['createdAt', 'DESC']],
                raw: true
            });

            const resFormatted = {
                data: users.rows.map(user => omitFields(user, 'password')),
                meta: {
                    pagination: {
                        limit: limitNumber,
                        offset,
                        total: users.count
                    }
                } 
            };

            return resFormatted;
        } catch (error) {
            throw error;
        }
    };
};

export const userServices = new UserServices();
