// libs
import express, { Request, Response, NextFunction } from 'express';

// utils
import { logger } from '@/utils';
import { sequelize } from '@/configs';
import { PORT } from '@/constants';
import { apiDocsRouter, authenticationRouter, userRouter } from '@/routes';
import app from './app';
import { globalErrorMiddleware, handleNotFoundRoute } from "@/middlewares/handleError";

sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables synced!');
}).catch((error) => {
    console.log('Error syncing database & tables:', error);
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World! - Start doing working with Node.js and TypeScript');
});

// Api docs
apiDocsRouter(app);

// All routers
authenticationRouter(app);
userRouter(app);

/**
 * Handle middleware with Top-down priority
 * - Route not found errors (must come before error middleware)
 * - General error handling middleware (must be last)
 */
app.use(handleNotFoundRoute);
app.use(globalErrorMiddleware);

export const startServer = () => {
    sequelize.sync().then(() => {
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    })
}

startServer();

export default app;