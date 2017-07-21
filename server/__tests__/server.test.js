import { Mockgoose } from 'mockgoose';
import mongoose from 'mongoose';
import server from '../../server';
import User from '../models/user';

// const request = require('supertest');
const session = require('supertest-session');
const verifiedUser = require('../__mockData__/verifiedUser.json');

const mockgoose = new Mockgoose(mongoose);

var testSession = session(server, {
  before: function (req) {
    req.set('user', {username: 'no-stack-dub-sack'});
  }
});

describe('api endpoints', () => {
  beforeAll(() => {
    // mockgoose intercepts the connection, no connection is made
    mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://localhost/testing-db', { useMongoClient: true }, err => {
        if (err)
          console.error(`There was an error connecting to mockgoose: ${err}`)
      })
    });
  });

  beforeEach(() => {
    mockgoose.helper.reset();
    User.create(verifiedUser, (err) => {
        if (err) {
          console.error(`Error creating documents in beforeEach: ${err}`);
        }
    })
  });

  /* test mockgoose works */
  it('returns 2 documents', () => {
    User.findOne({username: 'no-stack-dub-sack'}, (err, user) => {
      expect(user.username).toBe('no-stack-dub-sack');
    });
  });

  it('should defintely not respond with 401', async () => {
    const response = await testSession.post('/api/user');
    expect(response.statusCode).toBe(401);
  });
});
