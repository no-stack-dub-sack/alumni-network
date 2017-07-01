import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import passportRoute from './server/routes/passport';
import user from './server/routes/user';
import community from './server/routes/community';
import chat from './server/routes/chat';
import privateChat from './server/routes/private-chat';
import gitLabRoute from './server/helpers/gitlabRoute';

import WhiteListedUser from './server/models/whitelisted-user';
import HonoraryMember from './server/models/honorary-member';

// ALLOW SIGNUP W/O CERT(S):
export const isAllowed = false;
// temporarily set to true to
// allow anyone in (for dev)

dotenv.config();

// initialize mongoDB
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL).then(
  (res) => { console.log('Mongoose connected') },
  (err) => { console.error('Error connecting to MongoDB. Make sure MongoDB is running.') }
);

mongoose.connection.collection('whitelistedusers');
// initialize user whitelists only once
// HonoraryMember.findOne({ reason: 'initialize' }, (err, initialized) => {
//   if (err) throw err;
//   if (!initialized) {
//     const whiteListedUser = new WhiteListedUser({
//       githubUsername: '---',
//       fccUsername: '---'
//     });
//     whiteListedUser.save();
//
//     const honoraryMember = new HonoraryMember({
//       username: '---',
//       reason: 'initialize'
//     });
//     honoraryMember.save();
//   } else {
//     console.log('white lists already exist');
//   }
// });
//

// initialize Express app and setup routes
const app = express();
app.use(bodyParser.json());

app.use(passportRoute);
app.use(user);
app.use(community);
app.use(chat);
app.use(privateChat);
app.use(gitLabRoute);

// server main app and statis assets:
app.use(express.static(path.join(__dirname, '/client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

// initialize Express server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`Express Server is listening on port ${port}`));

// initialize Socket.io chat server
const io = require('socket.io')(server);
require('./server/chat/chat.js')(io);
