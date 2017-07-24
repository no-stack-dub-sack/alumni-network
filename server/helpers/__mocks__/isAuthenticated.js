const isAuthenticated = (req, res, next) => {
  // use supertest-session to fake auth;
  // this would be req.user in passport
  // authenticated application.
  if (req.headers.authorization) next();
  else res.sendStatus(302);
}

export default isAuthenticated;
