export const FIELDS_NAME = {
    EMAIL: 'email',
    PASSWORD: 'password',
    USER_NAME: 'username',
};

export const REGEX = {
    NAME: /^[a-zA-Z'-]{2,50}$/,
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
};

export const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
};

export const API_ENPOINTS = {
    REGISTER: '/api/v1/register',
    LOGIN: '/api/v1/login',
    GET_USERS: '/api/v1/users',
    GET_USER_BY_ID: '/api/v1/user',
    DELETE_USERS: '/api/v1/users',
    DELETE_USER_BY_ID: '/api/v1/users'
};

export const ROUTES = {
    BASE: '/',
};
