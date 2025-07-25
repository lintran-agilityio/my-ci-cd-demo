// libs
import express, { Request, Response, NextFunction } from 'express';

// utils
import { logger } from '@/utils';
import { sequelize } from '@/configs';
import { PORT } from '@/constants';
import { authenticationRouter, userRouter } from '@/routes';
import app from './app';

sequelize.sync({ alter: true }).then(() => {
    console.log('Database & tables synced!');
}).catch((error) => {
    console.log('Error syncing database & tables:', error);
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World! - Start doing working with Node.js and TypeScript');
});

// All routers
authenticationRouter(app);
userRouter(app);


export const startServer = () => {
    sequelize.sync().then(() => {
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    })
}

startServer();

export default app;