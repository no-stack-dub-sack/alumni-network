import app from './app';
import dotenv from 'dotenv';

dotenv.config();

/*
\\*
    We separate our app and server files
    so that supertest/jest won't listed
    to the port after testing... \_o_/
    reference: https://goo.gl/8G5tBH
\\*
*/

// initialize Express server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Express Server is listening on port ${port}`)
});

export default server;
