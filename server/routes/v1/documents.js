import express from 'express';

const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(200).send({
      message: 'Document Route',
    });
  });

export default Router;
