/* eslint-disable */
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';
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

export default function() {
  return new Promise(function(resolve, reject) {

    // initialize mockgoose
    const mockgoose = new Mockgoose(mongoose);
    mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://127.0.0.1:27017/alumninetwork-test', { useMongoClient: true })
      .then(
        (res) => console.log('Mockgoose test DB connected'),
        (err) => console.error('Error connecting to Mockgoose')
      );
    });

    const clientID = process.env.NODE_ENV === 'production'
    ? process.env.GITHUB_PROD_ID : process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.NODE_ENV === 'production'
    ? process.env.GITHUB_PROD_SECRET : process.env.GITHUB_SECRET;
    const credentials = `client_id=${clientID}&client_secret=${clientSecret}`;

    const mentorshipSkillsList = randomizeMentorship();

    const logResult = (users, completed) => {
      if (completed === fakeUsers.length) {
        console.log(`${completed} mock users exist in testing database`);
        resolve();
      } else if (users === fakeUsers.length) {
        console.log(`${users} out of ${fakeUsers.length} total users successfully pre-populated in testing database`);
        resolve();
      }
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
  });
};
