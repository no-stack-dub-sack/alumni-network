import axios from 'axios';
import Chat from '../models/chat';
import express from 'express';
import HonoraryMember from '../models/honorary-member';
import { isAllowedForDev } from '../../server';
import { isAuthenticated } from './passport';
import passport from 'passport';
import PrivateChat from '../models/private-chat';
import User from '../models/user';
import WhiteListedUser from '../models/whitelisted-user';
import {
  getFrontEndCert,
  getBackEndCert,
  getDataVisCert,
} from '../helpers/getCerts';

const router = express.Router();

// we post to avoid browser caching
router.post('/api/user', (req, res) => {
  if (req.user) {
    User.findOne({ username: req.user.username }, (err, user) => {
      if (!err) {
        res.send(user)
      } else {
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

router.post('/api/verify-credentials', isAuthenticated, (req, res) => {
  var username, honoraryMember = false;
  const { mongoId } = req.body;

  // if user is whitelisted, use their alternate username:
  WhiteListedUser.findOne({ githubUsername: req.body.username }, (err, user) => {
    if (err) throw err;
    if (user) {
      username = user.fccUsername;
    } else {
      username = req.body.username;
    }

    // if user is honorary member, they will be let in w/o certs:
    HonoraryMember.findOne({ username: username.toLowerCase() }, (err, user) => {
      if (err) throw err;
      if (user) {
        honoraryMember = true;
      }

      // process FCC verification...
      console.log(`processing verification for ${honoraryMember ? 'honorary member ' : ' '}${username}`);

      axios.all([
        getFrontEndCert(username),
        getBackEndCert(username),
        getDataVisCert(username)
      ]).then(axios.spread((frontCert, backCert, dataCert) => {
        let totalRedirects =
        frontCert.request._redirectCount +
        backCert.request._redirectCount +
        dataCert.request._redirectCount;
        if (honoraryMember || totalRedirects < 3) {
          return {
            Front_End: frontCert.request._redirectCount === 0 ? true : false,
            Back_End: backCert.request._redirectCount === 0 ? true : false,
            Data_Visualization: dataCert.request._redirectCount === 0 ? true : false,
          }
        } else {
          if (isAllowedForDev) {
            return {
              Front_End: false,
              Back_End: false,
              Data_Visualization: false,
            }
          } else {
            return false;
          }
        }
      })).then(certs => {
        if (!certs) {
          // user not verified, res with error
          User.findById(mongoId, (err, user) => {
            if (err) throw err;
            user.verifiedUser = false;
            user.save();
            res.status(401).json({ error: 'User cannot be verified' });
          });
        } else {
          // verified user, proceed
          User.findById(mongoId, (err, user) => {
            if (err) throw err;
            /* we need to overwrite their session username too
            (only matters for whitelisted users) */
            req.user.username = username;
            user.username = username;
            user.fccCerts = certs;
            user.verifiedUser = true;
            user.save();
            req.user.verifiedUser = true;
            req.user.fccCerts = certs;
            res.json({ user });
          });
        }
      });
    });
  });
});

router.post('/api/update-user', (req, res) => {
  const { user } = req.body;
  User.findById(user._id, (err, updatedUser) => {
    if (!err) {
      updatedUser.personal = user.personal;
      updatedUser.mentorship = user.mentorship;
      updatedUser.career = user.career;
      updatedUser.skillsAndInterests = user.skillsAndInterests;
      updatedUser.projects = user.projects;
      updatedUser.social = user.social;
      updatedUser.save();
      res.json({ updatedUser })
    } else {
      res.status(401).json({ error: 'User could not be saved' });
    }
  });
});

router.post('/api/update-user-partial', (req, res) => {
  const { id, section, sectionData } = req.body;
  User.findById(id, (err, updatedUser) => {
    if (!err) {
      updatedUser[section] = sectionData;
      updatedUser.save();
      res.json({ updatedUser })
    } else {
      res.status(401).json({ error: 'User could not be saved' });
    }
  });
});

/* if a user deletes their account we need to remove them
from chat and private chats as well because these rely on
user data derived from the community in some places. And
presumably we can assume if they want to remove their
account they want their chat history removed as well. */
router.post('/api/delete-user', (req, res) => {
  const { username } = req.user;
  console.log('deleting', username)
  User.findByIdAndRemove(req.user._id, (err, user) => {
    if (!err) {
      console.log(`${username} deleted`);
      Chat.findOne({}, (err, chat) => {
        if (!err) {
          if (chat) {
            console.log(`${username} removed from Global Chat`);
            chat.history = chat.history.filter(m => m.author !== username);
            chat.markModified('history');
            chat.save();
          }
        }
        PrivateChat.remove({ members: username }, (err, history) => {
          if (!err) {
            console.log(`${username}'s Private Chat deleted`);
            req.session.destroy();
            res.sendStatus(200);
          };
        });
      });
    } else {
      res.sendStatus(500);
    }
  });
});

export default router;
