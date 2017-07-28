import { Users, Roles, Documents } from '../models';
import { returnValidationErrors } from '../helpers/utils';

/**
 * @description searches for a user
 * @function searchUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const searchUser = (req, res) => {
  req.checkQuery('q', 'an email or name is required').notEmpty();
  returnValidationErrors(req, res);

  const queryString = (req.query.q).toString();
  Users.findAll({
    where: {
      $or: [{ email: {
        $iLike: `%${queryString}%`
      }
      },
      { fullname: {
        $iLike: `%${queryString}%`
      }
      }]
    },
    include: [{
      model: Roles,
      required: true,
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    }],
    attributes: { exclude: ['password', 'updatedAt'] },
  })
  .then((users) => {
    if (users.length === 0) {
      return res.status(200).send({
        status: 'ok',
        message: 'no result found for your query',
      });
    }
    return res.status(200).send({
      status: 'ok',
      users,
    });
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};

/**
 * @description searches for a document using title
 * @function searchUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const searchDocument = (req, res) => {
  req.checkQuery('q', 'a document title is required').notEmpty();

  returnValidationErrors(req, res);
  const queryString = (req.query.q).toString();

  Documents.findAll({
    where: {
      title: {
        $iLike: `%${queryString}%`
      }
    },
    include: [{
      model: Users,
      required: true,
      attributes: ['fullname', 'userId'],
    }],
    attributes: { exclude: ['content'] }
  })
  .then((docs) => {
    if (docs.length === 0) {
      return res.send([]);
    }
    return res.status(200).send({
      status: 'ok',
      documents: docs,
    });
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};

export default {
  searchDocument,
  searchUser,
};
