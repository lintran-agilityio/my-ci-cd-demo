// libs
import { Request, Response } from "express";

import { userServices } from "@/services";
import { STATUS_CODE } from "@/constants";

class UsersController {
    async getUsers(req: Request, res: Response) {
        const { query = { offset: 0, limit: 0 } } = req;
        console.log('query==>',query)
        const limitNumber = Number(query.limit) || 0;
        const offset = Number(query.offset) || 0;

        try {
            const dataRes = await userServices.getUsers(offset, limitNumber);

            return res.status(STATUS_CODE.OK).json({ data: dataRes });
        } catch (error) {
            return res.status(STATUS_CODE.OK).json({ error });
        }
    };
};

export const userController = new UsersController();
