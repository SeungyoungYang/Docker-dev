import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import mongo from "connect-mongo";
import mongoose from "mongoose";
import moment from 'moment';
import 'moment-timezone';
import { MONGODB_URI, SESSION_SECRET } from './utils/env';

const app = express();
const MongoStore = mongo(session);

// Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
  });

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: MONGODB_URI,
    autoReconnect: true
  })
}));
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

moment.tz.setDefault('Asia/Seoul')

// Route handlers
import * as index from './routes/index';
import * as user from './routes/user';
import * as item from './routes/item';

app.use('/', index.router);
app.use('/users', user.router);
app.use('/items', item.router);

// Start server
app.listen(app.get('port'), () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
});