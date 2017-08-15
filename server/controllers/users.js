import { Users, Roles, Documents } from '../models';
import {
  passwordHash,
  authenticateUser,
  catchError,
  returnValidationErrors,
  isRegisteredUser,
  pagination,
  verifyPassword,
} from '../helpers/utils';

/**
 * @description creates a user
 * @function createUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object
 */
const createUser = (req, res) => {
  req.checkBody('fullname', 'Full name cannot be empty').notEmpty();
  req.checkBody('email', 'Email cannot be empty').notEmpty();
  req.checkBody('email', 'Enter a valid email address').isEmail();
  req.checkBody('password', 'Password cannot be empty').notEmpty();

  returnValidationErrors(req, res);

  /** check if provided email already exists in user database */
  isRegisteredUser(req.body.email, 'email')
  .then((registeredUser) => {
    if (registeredUser) {
      return res.status(409).send({
        message: 'an account with this email already exists',
      });
    }
    if (!registeredUser) {
      return Users.create({
        fullname: req.body.fullname,
        password: passwordHash(req.body.password),
        email: req.body.email,
        roleId: 2,
      });
    }
  })
  .then(newUser => res.status(201).send({
    user: {
      userId: newUser.userId,
      fullname: newUser.fullname,
      email: newUser.email,
      roleId: newUser.roleId,
      created: newUser.createdAt,
    },
  }))
  .catch(() => catchError(res));
};

/**
 * @description authenticates user and generates token
 * @function loginUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object containing access token
 */
const loginUser = (req, res) => {
  req.checkBody('email', 'Email cannot be empty').notEmpty();
  req.checkBody('email', 'Enter a valid email address').isEmail();
  req.checkBody('password', 'Password cannot be empty').notEmpty();

  returnValidationErrors(req, res);

  Users.findOne({
    where: { email: req.body.email },
  })
  .then((user) => {
    if (!user) {
      return res.status(401).send({
        message: 'This email is not associated with any account',
      });
    }

    const token = authenticateUser(req.body.password, user);

    if (token) {
      return res.status(200).send({
        accessToken: token,
      });
    }
    return res.status(401).send({
      message: 'Authentication failed. Password is incorrect',
    });
  })
  .catch(() => catchError(res));
};

/**
 * @description view all user details
 * @function viewUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object of all users
 */
const viewUser = (req, res) => {
  /** set default values for offset and limit */
  let offset = 0;
  let limit = 20;
  if (req.query.limit || req.query.offset) {
    req.checkQuery('limit', 'Limit must be an integer and greater than 0').isInt({ gt: 0 });
    req.checkQuery('offset', 'Offset must be an integer greater or equal to 0').isInt({ gt: -1 });

    returnValidationErrors(req, res);

    /** convert limit and offset to number in base 10 */
    limit = parseInt(req.query.limit, 10);
    offset = parseInt(req.query.offset, 10);
  }

  Users.findAndCount({
    include: [
      {
        model: Roles,
        required: true,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    ],
    offset,
    limit,
    attributes: { exclude: ['email', 'password', 'updatedAt', 'roleId'] },
  })
  .then(users => res.status(200).send({
    pagination: pagination(limit, offset, users.count),
    users: users.rows.filter(user => user.userId !== 1),
  }))
  .catch(() => catchError(res));
};

/**
 * @description gets user details using id
 * @function getUserById
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object of matching user
 */
const getUserById = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();

  returnValidationErrors(req, res);

  Users.findOne({
    where: { userId: req.params.id },
    include: [
      {
        model: Roles,
        required: true,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      }
    ],
    attributes: { exclude: ['password', 'roleId'] },
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        message: 'This user does not exist or has been previously deleted',
      });
    }

    return res.status(200).send({
      user,
    });
  })
  .catch(() => catchError(res));
};

/**
 * @description updates user details
 * @function updateUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object containing updated user details
 */
const updateUser = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();
  req.checkBody('email', 'Email cannot be empty').notEmpty();
  req.checkBody('email', 'Enter a valid email address').isEmail();
  req.checkBody('password', 'Password cannot be empty').notEmpty();
  req.checkBody('oldPassword', 'Enter your current password to confirm password change').notEmpty();

  returnValidationErrors(req, res);

  Users.findOne({
    where: { userId: req.params.id },
    plain: true
  })
  .then((user) => {
    user.get({ plain: true });

    if (req.body.password && !verifyPassword(req.body.oldPassword, user.password)) {
      return res.status(403).send({
        message: 'Password confirmation failed. Enter your current password to confirm password change'
      });
    }

    const password = req.body.password ? passwordHash(req.body.password) : user.password;

    return user.update({
      password,
      fullname: req.body.fullname || user.fullname,
      email: req.body.email || user.email,
      roleId: user.roleId,
    });
  })
  .then(updatedUser => res.status(200).send({
    user: {
      userId: updatedUser.userId,
      fullname: updatedUser.fullname,
      email: updatedUser.email,
    },
  }))
  .catch(() => catchError(res));
};

/**
 * @description deletes user
 * @function deleteUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {void}
 */
const deleteUser = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();

  returnValidationErrors(req, res);

  if (parseInt(req.params.id, 10) === 1) {
    return res.status(403).send({
      message: 'You cannot delete this user',
    });
  }

  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        message: 'This user does not exist or has been previously deleted',
      });
    }

    return user.destroy();
  })
  .then(() => res.status(200).json({
    message: 'User was successfully deleted',
  }))
  .catch(() => catchError(res));
};

/**
 * @description gets all documents belonging a particular user
 * @function getUserDocuments
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object containing doccuments
 */
const getUserDocuments = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();

  returnValidationErrors(req, res);
  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        message: 'This user does not exist or has been previously deleted',
      });
    }

    return Documents.findAll({
      where: {
        userId: req.params.id,
      },
      attributes: { exclude: ['content', 'userId'] },
    });
  })
  .then((documents) => {
    if (documents.length === 0) {
      return res.status(404).send({
        message: 'No document associated with this user',
      });
    }
    return res.status(200).send({
      documents,
    });
  })
  .catch(() => catchError(res));
};

export default {
  createUser,
  viewUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  getUserDocuments,
};
