import chai from 'chai';
import http from 'chai-http';
import app from '../../../index';

const expect = chai.expect;
chai.use(http);

describe('Index route', () => {
  it('should return a status code of 200 and welcome message when accessed', (done) => {
    chai.request(app)
      .get('/api/v1/')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.keys(['message']);
        expect(res.body.message).to.equal('Welcome to DocMan API');
        done();
      });
  });
});
