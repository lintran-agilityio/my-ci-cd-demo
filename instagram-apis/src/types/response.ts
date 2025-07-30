// libs
import { Response, Request } from 'express';
import { IUserResponse } from './user';

type MessageType = {
    code: number,
    message: string;
};

export type ResponseSuccessType = {
    res: Response,
    message: MessageType,
    data: null|any
};

export type ResponseErrorType = {
    error: MessageType,
    response: Response
};

export interface RequestAuthenType extends Request {
    user?: IUserResponse;
};
