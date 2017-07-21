import HonoraryMember from '../models/honoraryMember';
import { Mockgoose } from 'mockgoose';
import mongoose from 'mongoose';

const mockgoose = new Mockgoose(mongoose);

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
    HonoraryMember.create(
      { username: 'someone', reason: 'a test' },
      { username: 'someone else', reason: 'another test' },
      (err) => {
        if (err) {
          console.error(`Error creating documents in beforeEach: ${err}`);
        }
    })
  });

  /* now that we can mock mongo calls, we should be able
  to test the API endpoints successfully using jest */
  it('returns 2 documents', () => {
    HonoraryMember.find({}, (err, users) => {
      expect(users.length).toBe(2)
    });
  });
});
