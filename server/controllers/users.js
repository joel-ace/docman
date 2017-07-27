import { Users, Roles, Documents } from '../models';
import { passwordHash, authenticateUser } from '../helpers/utils';

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
  req.checkBody('password', 'Password should be a minimum of 6 characters').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { email: req.body.email }
  }).then((user) => {
    if (user) {
      return res.status(400).send({
        status: 'error',
        message: 'An account with this email address already exists'
      });
    }
    Users.create({
      fullname: req.body.fullname,
      password: passwordHash(req.body.password),
      email: req.body.email,
      roleId: 2,
    })
    .then(
      newUser => res.status(201).send({
        status: 'ok',
        userDetails: {
          userId: newUser.userId,
          fullname: newUser.fullname,
          email: newUser.email,
          roleId: newUser.roleId,
          created: newUser.createdAt
        },
        message: 'Account creation was successful'
      })
    )
  .catch(error => res.status(400)
    .send({
      status: 'error',
      error,
      message: 'We encountered an error. Please try again later',
    })
  );
  });
};

/**
 * @description view all user details
 * @function viewUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object of all users
 */
const viewUser = (req, res) => {
  let offset,
    limit;
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

  Users.findAll({
    include: [{
      model: Roles,
      required: true
    }],
    offset,
    limit,
  })
  .then((users) => {
    if (users.length < 1) {
      return res.status(200).send({
        status: 'ok',
        message: 'No user found',
      });
    }

    const userObject = users.map(user => (
      {
        userId: user.userId,
        fullname: user.fullname,
        email: user.email,
        role: {
          roleId: user.roleId,
          roleName: user.Role.name,
        },
        createdAt: user.createdAt,
      })
    );

    return res.status(200).send({
      status: 'ok',
      users: userObject,
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
 * @description gets user details using id
 * @function getUserById
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object of matching user
 */
const getUserById = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { userId: req.params.id },
    attributes: { exclude: ['password'] }
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        status: 'error',
        message: 'This user does not exist or has been previously deleted'
      });
    }

    return res.status(200).send({
      status: 'ok',
      userDetails: user,
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
 * @description updates user details
 * @function updateUser
 * @param {object} req request object
 * @param {object} res response object
 * @returns {object} response object containing updated user details
 */
const updateUser = (req, res) => {
  req.checkParams('id', 'No user id supplied').notEmpty();
  req.checkParams('id', 'Only integers are allowed as user id').isInt();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (!user) {
      res.status(404).send({
        status: 'error',
        message: 'This user does not exist or has been previously deleted'
      });
    }

    user.update({
      fullname: req.body.fullname || user.email,
      email: req.body.email || user.email,
      password: passwordHash(req.body.password) || user.password,
      roleId: user.roleId
    })
    .then(updatedUser => res.status(200).send({
      status: 'ok',
      userDetails: {
        userId: updatedUser.userId,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
      },
    }))
    .catch(() => res.status(400).send({
      status: 'error',
      message: 'We encountered an error updating your details. Please try again later',
    }));
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
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

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (!user) {
      res.status(404).send({
        status: 'error',
        message: 'This user does not exist or has been previously deleted'
      });
    }

    user.destroy()
    .then(() => res.status(200).json({
      status: 'ok',
      message: 'User was successfully deleted'
    }))
    .catch(() => res.status(400).send({
      status: 'error',
      message: 'We encountered an error deleting user. Please try again later',
    }));
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
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

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { email: req.body.email }
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        status: 'error',
        message: 'This email is not associated with any account'
      });
    }

    const token = authenticateUser(req.body.password, user);

    if (token) {
      return res.status(200).send({
        status: 'ok',
        accessToken: token,
        message: 'Login was successful!',
      });
    }
    return res.status(400).send({
      status: 400,
      message: 'Authentication failed. Password is incorrect'
    });
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
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

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send({
      status: 'error',
      errors
    });
  }

  Users.findOne({
    where: { userId: req.params.id },
  })
  .then((user) => {
    if (!user) {
      return res.status(404).send({
        status: 'error',
        message: 'This user does not exist or has been previously deleted'
      });
    }

    Documents.findAll({
      where: {
        userId: req.params.id,
      },
      attributes: { exclude: ['content', 'userId'] }
    })
    .then((documents) => {
      if (documents.length === 0) {
        return res.status(404).send({
          status: 'ok',
          message: 'No document associated with this user'
        });
      }
      return res.status(200).send({
        status: 'ok',
        documents
      });
    })
    .catch(() => res.status(400).send({
      status: 'error',
      message: 'We encountered an error. Please try again later',
    }));
  })
  .catch(() => res.status(400).send({
    status: 'error',
    message: 'We encountered an error. Please try again later',
  }));
};


export default {
  createUser,
  viewUser,
  getUserById,
  updateUser,
  deleteUser,
  loginUser,
  getUserDocuments
};
