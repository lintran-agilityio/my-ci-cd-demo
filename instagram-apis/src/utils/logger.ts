import { createLogger, format, transports } from 'winston';
import { NextFunction, Request, Response } from 'express';
import path from 'path';

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(
            ({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
        )
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(__dirname, '../logs/app.log' )}),
    ]
});

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack || err.message);
    res.status(500).json({ error: 'Internal server error' });
}
