import { CLIENT_URL } from '../routes/passport';

// authentication middleware using express-session:
export default function isAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect(`${CLIENT_URL}/login`);
  }
}
