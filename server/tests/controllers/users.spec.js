import chai from 'chai';
import chaiHTTP from 'chai-http';
import app from '../../../app';

const expect = chai.expect;
chai.use(chaiHTTP);

let adminToken;
let userToken;

describe('Users', () => {
  describe('creating a new account ', () => {
    it('should get a status code of 201, token and user array if successful', (done) => {
      chai.request(app)
        .post('/api/v1/users')
        .send(
        {
          fullName: 'Emeka Obi',
          password: 'password',
          email: 'emeka@obi.com',
        }
        )
        .end((err, res) => {
          expect(res.status).to.equal(201);
          expect(res.body).include.keys(['token', 'user']);
          expect(res.body.user.userId).to.equal(3);
          expect(res.body.user.fullName).to.equal('Emeka Obi');
          expect(res.body.user.email).to.equal('emeka@obi.com');
          expect(res.body.user.roleId).to.equal(2);
          done();
        });
    });
    it('should get an error message and status code 409 if user already exists', (done) => {
      chai.request(app)
        .post('/api/v1/users')
        .send({
          userId: 40,
          fullName: 'Emeka Obi',
          password: 'password',
          email: 'emeka@obi.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(409);
          expect(res.body).include.keys(['message']);
          expect(res.body.message).to.equal('an account with this email already exists');
          done();
        });
    });
  });
  describe('during login', () => {
    it('should get an error message and status code 401 if email supplied does not exist', (done) => {
      chai.request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'password',
          email: 'emeka@admin.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('This email is not associated with any account');
          done();
        });
    });
    it('should get an error message and status code 401 if password is incorrect', (done) => {
      chai.request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'wrongPassword',
          email: 'admin@docman.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('Authentication failed. Password is incorrect');
          done();
        });
    });
    it('should get a status code of 200 and a token if login is successful', (done) => {
      chai.request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'qwerty',
          email: 'admin@docman.com',
        })
        .end((err, res) => {
          adminToken = res.body.accessToken;
          expect(res.status).to.equal(200);
          expect(res.body).to.have.keys(['accessToken']);
          done();
        });
    });
  });
  describe('viewing all users', () => {
    it('should get a status code of 200 if user is admin', (done) => {
      chai.request(app)
        .get('/api/v1/users')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.users[0].fullName).to.equal('Admin Account');
          expect(res.body.users[1].fullName).to.equal('Olalekan Haruna');
          done();
        });
    });
    it('should receive a status code of 200 and an array of user object', (done) => {
      chai.request(app)
        .get('/api/v1/users')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body.users));
          expect(res.body.users[0].fullName).to.equal('Admin Account');
          expect(res.body.users[0].userId).to.equal(1);
          expect(res.body.users[1].fullName).to.equal('Olalekan Haruna');
          expect(res.body.users[1].userId).to.equal(2);
          done();
        });
    });
    it('should get and paginate all users when limit and offset are supplied', (done) => {
      chai.request(app)
        .get('/api/v1/users/?limit=2&offset=0')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.body).to.have.keys(['users', 'pagination']);
          expect(res.body.users.length).to.equal(2);
          expect(res.body.users[0].fullName).to.equal('Admin Account');
          done();
        });
    });
  });
  describe('viewing a user using the user id', () => {
    it('should get a status code of 404 and error message if user does not exist', (done) => {
      chai.request(app)
        .get('/api/v1/users/20')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('user does not exist or has been previously deleted');
          done();
        });
    });
    it('should receive a status of 200 and an array of user object', (done) => {
      chai.request(app)
        .get('/api/v1/users/3')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user.fullName).to.equal('Emeka Obi');
          expect(res.body.user.email).to.equal('emeka@obi.com');
          done();
        });
    });
  });
  describe('searching for users using name', () => {
    it('should get a status code of 200 and an array of user object if search query matches a user', (done) => {
      chai.request(app)
        .get('/api/v1/search/users?q=Emeka')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.users[0].fullName).to.equal('Emeka Obi');
          expect(res.body.users[0].email).to.equal('emeka@obi.com');
          expect(res.body.users[0].userId).to.equal(3);
          done();
        });
    });
    it('should receive a status of 404 and message if no user was found', (done) => {
      chai.request(app)
        .get('/api/v1/search/users?q=Oluwatobi')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('no user found for your search query');
          done();
        });
    });
  });
  describe('updating a user using the user id', () => {
    before((done) => {
      chai.request(app)
          .post('/api/v1/users/login')
          .send({
            password: 'password',
            email: 'emeka@obi.com',
          })
          .end((err, res) => {
            userToken = res.body.accessToken;
            done();
          });
    });
    it('should get a status code of 403 if user requesting to update details is not account owner', (done) => {
      chai.request(app)
        .put('/api/v1/users/1')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Only the owner can access this resource');
          done();
        });
    });
    it('should receive a status of 200 if user details is successfully updated', (done) => {
      chai.request(app)
        .put('/api/v1/users/3')
        .send({
          oldPassword: 'password',
          password: 'newPassword',
          fullName: 'Chukwuemeka Obinna',
          email: 'emeka@obinna.com',
        })
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user.fullName).to.equal('Chukwuemeka Obinna');
          expect(res.body.user.email).to.equal('emeka@obinna.com');
          done();
        });
    });
    it('should receive a status of 400 if old password is not provided for password change', (done) => {
      chai.request(app)
        .put('/api/v1/users/3')
        .send({
          password: 'newPassword',
          fullName: 'Chukwuemeka Obinna',
          email: 'new@email.com',
        })
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body.errors).to.equal(
            'Enter your current password to confirm password change'
          );
          done();
        });
    });
    it('should receive a status of 403 if old password provided is not user password', (done) => {
      chai.request(app)
        .put('/api/v1/users/3')
        .send({
          oldPassword: 'hbnjkdnfjgfgfd',
          password: 'newPassword',
          fullName: 'Chukwuemeka Obinna',
          email: 'new@email.com',
        })
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal(
            'Password confirmation failed. Enter your current password to confirm password change'
          );
          done();
        });
    });
  });
  describe('viewing a document', () => {
    it('should get a status code of 404 and an error message if user id does not belong to a valid user', (done) => {
      chai.request(app)
        .get('/api/v1/users/4/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('user does not exist or has been previously deleted');
          done();
        });
    });
    it('should get a status code of 404 if user has no document', (done) => {
      chai.request(app)
        .get('/api/v1/users/3/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('No document associated with this user');
          done();
        });
    });
    it('should get documents belonging to the user with the supplied userId', (done) => {
      chai.request(app)
        .get('/api/v1/users/1/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).include.keys(['documents']);
          expect(res.body.documents[0].title).to.equal('A new title');
          expect(res.body.documents[0].access).to.equal('role');
          done();
        });
    });
  });
  describe('deleting a user', () => {
    it('should get a status code of 403 if user is not admin', (done) => {
      chai.request(app)
        .delete('/api/v1/users/1')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('Only the owner or an admin can access this resource');
          done();
        });
    });
    it('should get a status code of 403 if an attempt is made to delete the admin account by the admin', (done) => {
      chai.request(app)
        .delete('/api/v1/users/1')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(403);
          expect(res.body.message).to.equal('You cannot delete this user');
          done();
        });
    });
    it('should receive a status of 200 if user is successfully deleted', (done) => {
      chai.request(app)
        .delete('/api/v1/users/3')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('User was successfully deleted');
          done();
        });
    });
    it('should receive a status of 401 if user making the request does not exist in database', (done) => {
      chai.request(app)
        .delete('/api/v1/users/3')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('user making this request cannot be authenticated');
          done();
        });
    });
    it('should receive a status of 404 if user id does not exist in database', (done) => {
      chai.request(app)
        .delete('/api/v1/users/3')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('user does not exist or has been previously deleted');
          done();
        });
    });
  });
});
