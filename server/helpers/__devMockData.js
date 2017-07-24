/* eslint-disable */
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user';
import {
  skills,
  interests,
  generate,
  fakeUsers,
  mentorshipSource,
  randomizeMentorship,
  getCertifications,
} from './__mockDataAssets';

dotenv.config();

mongoose.Promise = require('bluebird');
mongoose.connect(process.env.MONGO_URL, { useMongoClient: true }).then(
  (res) => console.log('Mongoose connected'),
  (err) => console.error('Error connecting to MongoDB. Make sure MongoDB is running.')
);

const clientID = process.env.NODE_ENV === 'production'
  ? process.env.GITHUB_PROD_ID : process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.NODE_ENV === 'production'
  ? process.env.GITHUB_PROD_SECRET : process.env.GITHUB_SECRET;
const credentials = `client_id=${clientID}&client_secret=${clientSecret}`;

const mentorshipSkillsList = randomizeMentorship();

const logResult = (users, completed) => {
  if (users === fakeUsers.length) {
    console.log(`${users} out of ${fakeUsers.length} total users successfully pre-populated in database`);
    mongoose.disconnect();
  } else if (completed === fakeUsers.length) {
    console.log(`${completed} mock users exist in database`);
    mongoose.disconnect();
  };
};

(function() {
  let users = 0;
  let completed = 0;
  fakeUsers.forEach(user => {
    axios.get(`https://api.github.com/users/${user}?${credentials}`)
    .then(response => {
      const { data } = response;

      const isMentor = Math.random() > 0.5;
      let mentorshipSkills = '';

      if (isMentor) mentorshipSkills = mentorshipSkillsList.pop();

      User.findOne({ username: data.login }, (err, user) => {
        if (!user) {
          getCertifications(data.login).then(certs => {
            console.log(`${data.login} created in database.`);
            users++;
            completed++;
            User.create({
              githubId: data.id,
              username: data.login,
              fccCerts: certs,
              verifiedUser: true,
              personal: {
                memberSince: new Date(),
                avatarUrl: data.avatar_url,
                profileUrl: data.Url,
                displayName: data.name ? data.name : '',
                email: data.email ? data.email : '',
                location: data.location ? data.location : '',
                bio: data.bio ? data.bio : '',
              },
              mentorship: {
                isMentor,
                mentorshipSkills
              },
              skillsAndInterests: {
                coreSkills: generate(skills, 0.2),
                codingInterests: generate(interests, 0.5)
              },
              career: {
                company: data.company ? data.company : '',
              }
            }, ((err, newUser) => {
              if(err) console.error(err);
              logResult(users, completed);
            }));
          }).catch(err => console.error(err));
        } else {
          completed++;
          logResult(users, completed);
        };
      });
    }).catch(err => console.error(err));
   });
})();
