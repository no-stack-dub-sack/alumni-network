import bodyParser from 'body-parser';
import community from './server/routes/community';
import dotenv from 'dotenv';
import express from 'express';
import gitLabRoute from './server/helpers/gitlabRoute';
import { Mockgoose } from 'mockgoose';
import mongoose from 'mongoose';
import passportRoute from './server/routes/passport';
import path from 'path';
import user from './server/routes/user';

dotenv.config();

// ALLOW SIGNUP W/O CERT(S):
export const isAllowedForDev = false;
// temporarily set to true to
// allow anyone in (for dev)

mongoose.Promise = require('bluebird');
// initialize mongoDB or mockgoose
// depedning on current environment
if (process.env.NODE_ENV === 'test') {
  const mockgoose = new Mockgoose(mongoose);
  mockgoose.prepareStorage().then(function() {
    mongoose.connect('mongodb://127.0.0.1:27017/alumninetwork-test', { useMongoClient: true })
    .then(
      (res) => console.log('Mockgoose test DB connected'),
      (err) => console.error('Error connecting to Mockgoose')
    );
  });
} else {
  mongoose.connect(process.env.MONGO_URL, { useMongoClient: true })
  .then(
    (res) => console.log('Mongoose connected'),
    (err) => console.error('Error connecting to MongoDB. Make sure MongoDB is running.')
  );
}

// initialize Express app and setup routes
const app = express();
app.use(bodyParser.json());
app.use(passportRoute);
app.use(user);
app.use(community);
app.use(gitLabRoute);

// serve main app and statis assets:
app.use(express.static(path.join(__dirname, '/client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

// initialize Express server & export for testing
const port = process.env.PORT || 8080;
export default app.listen(port, () => {
  console.log(`Express Server is listening on port ${port}`)
});
