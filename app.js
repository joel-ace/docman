import express from 'express';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
import morgan from 'morgan';
import path from 'path';
import routes from './server/routes/v1';

const app = express();

app.use(express.static(path.join(__dirname, '../documentation')));

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());

/** Solves error resulting from setting header when header is already sent */
app.use((req, res, next) => {
  const send = res.send;
  let sent = false;
  res.send = (data) => {
    if (sent) return;
    send.bind(res)(data);
    sent = true;
  };
  next();
});

/** render API documentation */
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'documentation', 'index.html'));
});

/** Use routes from the imported routes for api version 1 */
app.use('/api/v1', routes);

/** default message for every other route */
app.use('*', (req, res) => (
  res.status(404).send({
    message: 'this resource does not exist or has been previously deleted',
  })
));

/** Tell server to listen on availabe environment port or use 3000 */
app.listen(process.env.PORT || 3000);

export default app;
