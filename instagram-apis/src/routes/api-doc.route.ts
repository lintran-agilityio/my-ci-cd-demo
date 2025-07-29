// libs
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

import { API_ENPOINTS } from '@/constants';
import { swaggerSpec } from '@/apiDoc/swapper';

export const apiDocsRouter = (app: Application) => {
    app.use(API_ENPOINTS.API_DOCS, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
};
