const jwt = require('jsonwebtoken');
const secret = "secret $tash";

async function withAuth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token || token === null) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded.email;
      }
      next();
    });
  }
}
module.exports = withAuth;