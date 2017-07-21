import express from 'express';

const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(200).send({
      message: 'Search Route',
    });
  });

export default Router;