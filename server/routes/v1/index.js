import express from 'express';
import users from './users';
import documents from './documents';
import search from './search';

const Router = express.Router();

/** Setup routing for index */
Router.route('/')
  .get((req, res) => {
    res.status(200).send({
      message: 'Welcome to DocMan API',
    });
  });

/** Use imported files for users, documents and search routes */
Router.use('/users', users);
Router.use('/documents', documents);
Router.use('/search', search);

export default Router;
