import express from 'express';

const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(200).send({
      message: 'User Route',
    });
  });

export default Router;
