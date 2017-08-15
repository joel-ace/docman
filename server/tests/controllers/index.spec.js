import chai from 'chai';
import chaiHTTP from 'chai-http';
import app from '../../../app';

const expect = chai.expect;
chai.use(chaiHTTP);

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
