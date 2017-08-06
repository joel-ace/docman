import chai from 'chai';
import http from 'chai-http';
import app from '../../../index';

const expect = chai.expect;
chai.use(http);

let adminToken, userToken;

describe('Users', () => {
  describe('creating a new account ', () => {
    it('should get a status code of 201 if successful', (done) => {
      chai.request(app)
        .post('/api/v1/users')
        .send(
        {
          fullname: 'Emeka Obi',
          password: 'password',
          email: 'emeka@obi.com',
        }
        )
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });
    it('should get an error message and status code 400 if user already exists', (done) => {
      chai.request(app)
        .post('/api/v1/users')
        .send({
          userId: 40,
          fullname: 'Emeka Obi',
          password: 'password',
          email: 'emeka@obi.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.body).include.keys(['message']);
          done();
        });
    });
  });
  describe('during login', () => {
    it('should get an error message and status code 404 if user does not exists', (done) => {
      chai.request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'password',
          email: 'emeka@admin.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
    });
    it('should get an error message and status code 400 if password is incorrect', (done) => {
      chai.request(app)
        .post('/api/v1/users/login')
        .send({
          password: 'wrongPassword',
          email: 'admin@docman.com',
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
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
          expect(res.body).to.have.keys(['accessToken', 'message']);
          done();
        });
    });
  });
  describe('viewing all users', () => {
    it('should get a status code of 200 if successful', (done) => {
      chai.request(app)
        .get('/api/v1/users')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should receive an array of user object', (done) => {
      chai.request(app)
        .get('/api/v1/users')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body.users));
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
          done();
        });
    });
  });
  describe('viewing a user using the user id', () => {
    it('should get a status code of 404 if user does not exist', (done) => {
      chai.request(app)
        .get('/api/v1/users/20')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This user does not exist or has been previously deleted');
          done();
        });
    });
    it('should receive a status of 200 and an array of user object', (done) => {
      chai.request(app)
        .get('/api/v1/users/3')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(Array.isArray(res.body.userDetails));
          done();
        });
    });
  });
  describe('searching for users using name', () => {
    it('should get a status code of 200 if user exists', (done) => {
      chai.request(app)
        .get('/api/v1/search/users?q=Emeka')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
    it('should receive a status of 200 and message if no user was found', (done) => {
      chai.request(app)
        .get('/api/v1/search/users?q=Oluwatobi')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          console.log(res.body)
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('no user found for your query');
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
    it('should get a status code of 401 if user requesting to update details is not account owner', (done) => {
      chai.request(app)
        .put('/api/v1/users/1')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('Only the owner can access this resource');
          done();
        });
    });
    it('should receive a status of 200 if user details is successfully updated', (done) => {
      chai.request(app)
        .put('/api/v1/users/3')
        .send({
          password: '',
          fullname: 'Chukwuemeka Obi',
        })
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          done();
        });
    });
  });
  describe('viewing a document', () => {
    it('should get a status code of 404 if user id does not belong to a valid user', (done) => {
      chai.request(app)
        .get('/api/v1/users/4/documents')
        .set({ Authorization: adminToken })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(res.body.message).to.equal('This user does not exist or has been previously deleted');
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
          done();
        });
    });
  });
  describe('deleting a user', () => {
    it('should get a status code of 401 if user is not admin', (done) => {
      chai.request(app)
        .delete('/api/v1/users/1')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body.message).to.equal('Only the owner or an admin can access this resource');
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
    it('should receive a status of 400 if user making the request does not exist in database', (done) => {
      chai.request(app)
        .delete('/api/v1/users/3')
        .set({ Authorization: userToken })
        .end((err, res) => {
          expect(res.status).to.equal(400);
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
          expect(res.body.message).to.equal('This user does not exist or has been previously deleted');
          done();
        });
    });
  });
});
