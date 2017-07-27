import { Users, Roles, Documents } from '../models';

/**
 * @description creates a document
 * @function createDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const createDocument = (req, res) => {
  req.checkBody('title', 'fullname cannot be empty').notEmpty();
  req.checkBody('content', 'content cannot be empty').notEmpty();
  req.checkBody('access', 'access cannot be empty').notEmpty();
  req.checkBody('access', 'public, private and role are the only allowed acces types')
    .isIn(['public', 'private', 'role']);
  req.checkBody('access', 'only letters of the alphabets are allowed as access').isAlpha();
  req.checkBody('userId', 'userId cannot be empty').notEmpty();
  req.checkBody('userId', 'only integers are allowed as userId').isInt();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { userId: parseInt(req.decoded.role, 10) },
  })
  .then((user) => {
    if (!user) {
      return res.status(400).send({
        status: 'error',
        message: 'the userId provided does not belong to any user'
      });
    }

    Documents.create({
      title: req.body.title,
      content: req.body.content,
      access: req.body.access,
      userId: req.decoded.role,
    })
    .then(
      document => res.status(201).send({
        status: 'ok',
        document,
        message: 'document was successfully created'
      })
    )
    .catch(error => res.status(400)
      .send({
        status: 'error',
        error,
        message: 'We encountered an error. Please try again later',
      })
    );
  })
  .catch(error => res.status(400)
    .send({
      status: 'error',
      error,
      message: 'We encountered an error. Please try again later',
    })
  );
};

/**
 * @description view all documents
 * @function viewDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const viewDocument = (req, res) => {
  let offset, limit;
  if (req.query.limit || req.query.offset) {
    req.checkQuery('limit', 'Limit must be an integer').isInt();
    req.checkQuery('offset', 'Offset must be an integer').isInt();

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).send({
        status: 'error',
        errors
      });
    }

    /** convert limit and offset to number in base 10 */
    limit = parseInt(req.query.limit, 10);
    offset = parseInt(req.query.offset, 10);
  }

  Documents.findAll({
    include: [{
      model: Users,
      required: true
    }],
    offset,
    limit,
  })
  .then((documents) => {
    if (documents.length < 1) {
      return res.status(200).send({
        status: 'ok',
        message: 'No document found',
      });
    }

    const docs = documents.map(document => (
      {
        documentId: document.documentId,
        title: document.title,
        access: document.access,
        author: {
          userId: document.User.roleId,
          fullname: document.User.fullname,
        },
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      })
    );

    return res.status(200).send({
      status: 'ok',
      documents: docs,
    });
  })
  .catch(error => res.status(400)
    .send({
      status: 'error',
      error,
      message: 'We encountered an error. Please try again later',
    })
  );
};

/**
 * @description view a document using its id
 * @function getDocumentById
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const getDocumentById = (req, res) => {
  req.checkParams('id', 'No document id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as document id').isInt();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Documents.findOne({
    where: { documentId: req.params.id },
    attributes: { exclude: ['userId'] },
    include: [{
      model: Users,
      required: true,
      attributes: ['userId', 'fullname']
    }],
  })
  .then((document) => {
    if (!document) {
      return res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted'
      });
    }

    return res.status(200).send({
      status: 'ok',
      document,
    });
  })
  .catch(error => res.status(400)
    .send({
      status: 'error',
      error,
      message: 'We encountered an error. Please try again later',
    })
  );
};

export default {
  createDocument,
  viewDocument,
  getDocumentById,
};
