import createMockUsers from '../helpers/__testMockData';
import server from '../../server';
import session from 'supertest-session';

// mock isAuthenticated middleware
jest.mock('../helpers/isAuthenticated');


describe('unauthenticated community api requests', () => {
  var req, res;
  beforeEach(async () => {
    /* create an "unauthenticated" session.
    also, see next suite's beforeEach hook. */
    req = session(server);
    res = await req.get('/api/community');
  });

  it('responds to GET request', () => {
    expect(res).toBeDefined();
  });

  it('responds with 302 status code (redirects)', () => {
    expect(res.statusCode).toBe(302);
  });

});

describe('authenticated community api requests', () => {
  var req, res;

  beforeAll(() => {
    return createMockUsers();
  })

  beforeEach(async () => {
    req = session(server, {
      before: function (req) {
        /* fake authentication here: mocked
        isAuthenticated middleware simply expects the
        following header. In production, this would be
        replaced by a unique cookie generated by passport */
        req.set('authorization', 'Basic aGVsbG86d29ybGQK');
      }
    });
    res = await req.get('/api/community');
  });

  it('responds to GET request', () => {
    expect(res).toBeDefined();
  });

  it('request must be authenticated', () => {
    // in prod, would be checking for req.user
    expect(res.request.header.authorization)
  });

  it('responds with 200 status code', () => {
    expect(res.statusCode).toBe(200);
  });

  it('responds with 404 if method is POST, PUT, or DELETE', async () => {
    const res1 = await req.post('/api/community');
    const res2 = await req.put('/api/community');
    const res3 = await req.delete('/api/community');
    [ res1, res2, res3 ].forEach(res => {
      expect(res.statusCode).toBe(404);
    });
  });

  it('has content-type application/json', () => {
    expect(res.type).toBe('application/json');
  });

  it('has a payload containing array of users', () => {
    expect(Array.isArray(res.body.users));
  });

  it('has a payload containing the correct # of users', () => {
    expect(res.body.users).toHaveLength(15);
  });

  it('protects private email addresses', () => {
    res.body.users.forEach(user => {
      if (user.personal.email.private) {
        expect(user.personal.email.email).toBe(null);
      }
    });
  });

  it('array of users contains user objects', () => {
    res.body.users.forEach(user => {
      expect(
        user !== null &&
        typeof user === 'object' &&
        !Array.isArray(user)
      );
    });
  });

});
