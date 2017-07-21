import axios from 'axios';
import { Mockgoose } from 'mockgoose';
import mongoose from 'mongoose';
import User from '../models/user';

const mockgoose = new Mockgoose(mongoose);
const verifiedUser = require('../__mockData__/verifiedUser.json');

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

  /* now that we can mock mongo calls, we should be able
  to test the API endpoints successfully using jest */
  it('returns 2 documents', () => {
    // User.findOne({username: 'no-stack-dub-sack'}, (err, user) => {
    //   expect(user.username).toBe('no-stack-dub-sack');
    // });
    axios.post('/api/user').then(res => {
      expect(res.data).toBeDefined();
    })
  });
});
