// constants
import { FIELDS_NAME, MESSAGES_VALIDATION, REGEX } from '@/constants';
import { IUserInfo, IUserLogin, IValidationError } from '@/types';

const validateAuthentication = ({
    email,
    password,
}: IUserLogin) => {
    let errors: IValidationError[] = [];

    // validate email
    if (!email) {
        const error: IValidationError = {
            field: FIELDS_NAME.EMAIL,
            message: MESSAGES_VALIDATION.REQUIRED,
        };
        errors.push(error);
    } else if (!REGEX.EMAIL.test(email)) {
        const error: IValidationError = {
            field: FIELDS_NAME.EMAIL,
            message: MESSAGES_VALIDATION.INVALID_FORMAT,
        };
        errors.push(error);
    }

    // validate password
    if (!password) {
        const error: IValidationError = {
            field: FIELDS_NAME.PASSWORD,
            message: MESSAGES_VALIDATION.REQUIRED,
        };
        errors.push(error);
    } else if (!REGEX.PASSWORD.test(password)) {
        const error: IValidationError = {
            field: FIELDS_NAME.PASSWORD,
            message: MESSAGES_VALIDATION.INVALID_FORMAT,
        };
        errors.push(error);
    }

    return errors;
};

export const validateRegisterUser = ({
    email,
    password,
    username
}: IUserInfo) => {
    let errors: IValidationError[] = [];

    errors = validateAuthentication({ email, password });

    // validate firstName
    if (!username) {
        const error: IValidationError = {
            field: FIELDS_NAME.USER_NAME,
            message: MESSAGES_VALIDATION.REQUIRED,
        };

        errors.push(error);
    } else if (!REGEX.NAME.test(username)) {
        const error: IValidationError = {
            field: FIELDS_NAME.USER_NAME,
            message: MESSAGES_VALIDATION.INVALID_FORMAT,
        };
        errors.push(error);
    }

    return errors;
};

export const validateLoginUser = ({
    email,
    password,
}: IUserLogin) => {
    let errors: IValidationError[] = [];

    errors = validateAuthentication({ email, password });

    return errors;
};
