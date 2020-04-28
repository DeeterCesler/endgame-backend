const jwt = require('jsonwebtoken');
const secret = "secret $tash";
const User = require('../models/user');

ownerCheck = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token || token === null) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    console.log('token: ' + token);
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            res.status(401).send('Unauthorized: Invalid token');
        } else {
          User.findOne({email: decoded}, function(err, foundUser){
            console.log(foundUser)
              if (foundUser.owner) {
                console.log('Confirmed owner.');
              } else {
                res.sendStatus(403);
              };
          });
        }
    next();
    });
  }
}
module.exports = ownerCheck;