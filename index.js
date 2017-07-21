import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import routes from './server/routes/v1';

const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use('/api/v1', routes);

app.listen(process.env.PORT || 3000);
