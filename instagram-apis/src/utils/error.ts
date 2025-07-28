import { IErrorWithStatus } from "@/types";

export const toError = (value: unknown) => {
    if (value instanceof Error) return value;

    const message = typeof value === 'string'
        ? value
        : (() => {
            try {
                return JSON.stringify(value);
            } catch (error) {
                return 'Unserializable thrown value';
            }
        })();

    return new Error(`Non-Error thrown: ${message}`);
};

export const globalErrorHandler = (statusCode: number, message: string): IErrorWithStatus => {
    const error = new Error(message) as IErrorWithStatus;
    error.statusCode = statusCode;
    return error;
};
