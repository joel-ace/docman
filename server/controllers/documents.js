import { Users, Documents } from '../models';

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
      userId: req.decoded.userId,
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
      attributes: ['userId', 'fullname', 'roleId']
    }],
  })
  .then((docs) => {
    /** return only values of document*/
    const document = docs.get({ plain: true });

    if (!document) {
      return res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted'
      });
    }

    if (document.access === 'public'
      || req.decoded.role === 1
      || document.User.userId === req.decoded.userId
      || (document.access === 'role' && document.User.roleId === req.decoded.role)
    ) {
      return res.status(200).send({
        status: 'ok',
        document,
      });
    }

    return res.status(401).send({
      status: 'error',
      message: 'You are not authorized to view this document',
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
 * @description updates a document
 * @function updateDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const updateDocument = (req, res) => {
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
  })
  .then((document) => {
    if (!document) {
      res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted'
      });
    }

    if (req.decoded.userId === document.userId) {
      document.update({
        title: req.body.title || document.title,
        content: req.body.content || document.content,
        access: req.body.access || document.access,
      })
      .then(doc => res.status(200).send({
        status: 'ok',
        doc,
      }))
      .catch(() => res.status(400).send({
        status: 'error',
        message: 'We encountered an error updating your document. Please try again later',
      }));
    } else {
      return res.status(401).send({
        status: 'error',
        message: 'Only the document owner can update a document',
      });
    }
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};

/**
 * @description deletes a document
 * @function deleteDocument
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const deleteDocument = (req, res) => {
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
  })
  .then((document) => {
    if (!document) {
      res.status(404).send({
        status: 'error',
        message: 'This document does not exist or has been previously deleted'
      });
    }

    if (req.decoded.userId === document.userId || req.decoded.role === 1) {
      document.destroy()
      .then(() => res.status(200).send({
        status: 'ok',
        message: 'Document successfully deleted'
      }))
      .catch(() => res.status(400).send({
        status: 'error',
        message: 'We encountered an error updating your document. Please try again later',
      }));
    } else {
      return res.status(401).send({
        status: 'error',
        message: 'Only the document owner and admin can delete a document',
      });
    }
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};


export default {
  createDocument,
  viewDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
