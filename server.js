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
import dropdown from './server/routes/dropdown';

dotenv.config();

// initialize mongoDB
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL, () => console.log('Mongoose connected'));

/*=========== Populating DB with user data =====>
This will only save users if they don't exist locally yet */
// require('./server/helpers/mockData');

//*==== Populating DB with dynamic-dropdown data ====>
require('./server/helpers/populateDropdowns');

// initialize Express app and setup routes
const app = express();
app.use(bodyParser.json());

app.use(passportRoute);
app.use(user);
app.use(community);
app.use(chat);
app.use(privateChat);
app.use(gitLabRoute);
app.use(dropdown);

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
