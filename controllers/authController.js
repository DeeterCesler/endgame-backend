const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const withAuth = require("../middleware/authToken");
const secret = "secret $tash";
const sendResetPasswordEmail = require('../emails');


router.post('/verify', withAuth, async (req, res) => {
    const token = req.headers["authorization"];
    testObj = {message: "test"}
    jwt.verify(token, secret, async function(err, decoded) {
        if (err) {
          res.status(401).send('Unauthorized: Invalid token');
        } else {
          req.email = decoded;
          let foundUser = "";
          try{
              console.log("EMAIL: " + req.email)
              foundUser = await User.findOne({email: req.email});
              foundUserId = foundUser._id
          } catch(err){
              console.log(err)
              foundUser = "lol"
          }
          res.send({
            status: 200,
            email: decoded,
            id: foundUserId
          })
      }
    })
});

router.post('/register', async (req, res) => {
    try{
        // Check to see if username already exists
        const possibleUser = await User.find({ email: req.body.email });
        console.log('poss user: ' + possibleUser.length)
        if (possibleUser.length) {
            console.log('got here!!' + possibleUser.email);
            res.send({
                status: 401,
                message: "Email is already registered.",
            })
        } else {
            console.log('got here i guess!!')
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
            // Create an object to put into our database into the User Model
            const userEntry = {};
            userEntry.password = passwordHash;
            userEntry.email = req.body.email.toLowerCase();
            userEntry.name = req.body.name;
            const user = await User.create(userEntry);
            console.log('user id: ' + user._id);
            user.save();
            res.send({
                status: 200,
                data: user,
            });
            console.log("done registered");
        }
    } catch(err) {
        console.log(err);
    }
});

router.post('/reset', async (req, res) => {
    console.log('here i guesss: ' + JSON.stringify(req.body));
    try{
        const email = req.body.email.toLowerCase();
        const foundUser = await User.findOne({email: email});
        console.log('found bish: ' + foundUser);
        if (foundUser) {
            console.log('User found. Sending a password reset email.');
            sendResetPasswordEmail(foundUser);
        } else {
            console.log('not a real user lol');
        }
    } catch (err) {
        console.log('Error: ' + err);
        res.send(err);
    }
});

router.post('/reset/confirm', async (req, res) => {
    console.log('fuck + ' + JSON.stringify(req.body))
    try {
        const id = req.body.id;
        const password = req.body.password;
        const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
        console.log('pw hash: ' + passwordHash)
        const foundUser = await User.findByIdAndUpdate(id, {password: passwordHash});
        console.log('foudn user::: ' + foundUser);
        // foundUser.update({password: passwordHash});
        // foundUser.save();
        res.send(200);
    } catch (e) {
        console.log('error: ' + e);
    }
});
  
  
router.post('/login', async (req, res) => {
    console.log("TRYING LOGIN")
    console.log("REK BODY: " + JSON.stringify(req.body))
    const { email, password } = req.body
    console.log('EMAIL: ' + email);
    console.log('PASSWERD: ' + password);
    try {
        console.log("GOT HERE")
        const foundUser = await User.findOne({email: req.body.email.toLowerCase()});
        if(foundUser){
            console.log("PWs - " + req.body.password + foundUser.password)
            if(bcrypt.compareSync(req.body.password, foundUser.password)){
                const payload = foundUser.email;
                const token = jwt.sign(payload, "secret $tash");
                res.send({
                    status: 200,
                    data: foundUser,
                    token: token
                })
                console.log("done logged in")
            } else {
                console.log("wrong password")
                res.send({
                    status: 401,
                    data: "Username or Password is Wrong",
                });
            }
        } else {
            console.log("no user bitch")
            res.send({
                status: 401,
                data: "Username or Password is Wrong",
            });
        }
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});
  
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.send(err);
        } else {
            res.redirect('/')
        }
    });
});
  
  
module.exports = router;