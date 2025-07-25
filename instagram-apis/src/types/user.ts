export interface IUserLogin {
    email: string;
    password: string;
};

export interface IUserInfo extends IUserLogin {
    username: string;
};

export interface IUser extends IUserInfo {
    user_id: number;
}

export type IUserResponse = Omit<IUser, 'password'>;