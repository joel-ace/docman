import express from 'express';
import userRoutes from './users';
import documentRoutes from './documents';
import searchRoutes from './search';

const Router = express.Router();

/** Setup routing for index */
Router.route('/')
  .get((req, res) => {
    res.status(200).send({
      message: 'Welcome to DocMan API',
    });
  });

/** Use imported files for users, documents and search routes */
Router.use('/users', userRoutes);
Router.use('/documents', documentRoutes);
Router.use('/search', searchRoutes);

export default Router;
