const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const withAuth = require("../middleware/authToken");
const secret = "secret $tash";
const sendResetPasswordEmail = require('../emails');
require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_KEY);


router.post('/success/confirm', async (req, res) => {
    try {
        const foundUser = await User.findOne({sessionId: req.body.sessionId});
        if (foundUser.planType.slice(0,6) !== "maybe:") {
            console.log('Plan Type previously confirmed. Re-routing...')
            console.log(foundUser.planType)
        } else {
            foundUser.planType = foundUser.planType.slice(6);
            const today = new Date();
            foundUser.signupDate = today;
            await foundUser.save();
        }
    } catch(err) {
        console.log('err: ' + err)
    }
    res.json({
        status: 200,
        loggedIn: true,
        data: "All is well with the world."
    })
});

router.post('/checkout', async (req, res) => {
    let planId;
    switch (req.body.planType) {
        case "loneWolf":
            planId = process.env.LONE_WOLF;
            break;
        case "startup":
            planId = process.env.STARTUP;
            break;
        case "enterprise":
            planId = process.env.ENTERPRISE;
            break;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        subscription_data: {
          items: [{
            plan: planId,
          }],
        },
        success_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL,
    });
    const foundUser = await User.findOne({email: req.body.email});
    foundUser.sessionId = session.id;
    foundUser.planType = "maybe:" + req.body.planType;
    await foundUser.save();

    res.json({
        sessionId: session.id,
        status: 200,
    })      
});

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
              foundUserId = foundUser._id;
              name = foundUser.name;
              owner = foundUser.owner;
              groupAdmin = foundUser.groupAdmin;
              if (foundUser.signupDate !== undefined) {
                signupDate = foundUser.signupDate;
                planType = foundUser.planType;
                isRegistered = true;
                loggedIn = true;
              } else {
                signupDate = null;
                planType = null;
                isRegistered = true;
                loggedIn = false;
              }
          } catch(err){
              console.log(err)
          }
          res.send({
            status: 200,
            email: decoded,
            id: foundUserId,
            name: name,
            owner: owner,
            groupAdmin: groupAdmin,
            planType: planType,
            signupDate: signupDate,
            loggedIn: loggedIn,
            isRegistered: isRegistered
          })
        }
    })
});

router.post('/register', async (req, res) => {
    try{
        // Check to see if username already exists
        const possibleUser = await User.find({ email: req.body.email });
        if (possibleUser.length) {
            res.send({
                status: 401,
                message: "Email is already registered.",
            });
        } else {
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
            
            // Create an object to put into our database into the User Model
            const userEntry = {};
            userEntry.password = passwordHash;
            userEntry.email = req.body.email.toLowerCase();
            userEntry.name = req.body.name;

            const user = await User.create(userEntry);
            const token = jwt.sign(user.email, "secret $tash");
            
            user.save();
            
            res.send({
                status: 200,
                data: user,
                token: token
            });
            console.log("done registered");
        }
    } catch(err) {
        console.log(err);
    }
});

router.post('/reset', async (req, res) => {
    try{
        console.log('okay')
        const email = req.body.email.toLowerCase();
        console.log('email: ' + email);
        const foundUser = await User.findOne({email: email});
        if (foundUser) {
            console.log('User found. Sending a password reset email.');
            sendResetPasswordEmail(foundUser);
            res.json({
                status: 200,
            })
        } else {
            console.log('not a real user lol');
            res.json({
                status: 401,
            })
        }
    } catch (err) {
        console.log('Error: ' + err);
        res.send({
            status: 500,
            data: err,
        });
    }
});

router.post('/reset/confirm', async (req, res) => {
    try {
        const id = req.body.id;
        const password = req.body.password;
        const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
        await User.findByIdAndUpdate(id, {password: passwordHash});
        res.json({
            status: 200,
        })
    } catch (e) {
        console.log('error: ' + e);
    }
});
  
  
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const foundUser = await User.findOne({email: req.body.email.toLowerCase()});
        if(foundUser){
            if(bcrypt.compareSync(req.body.password, foundUser.password)){
                const payload = foundUser.email;
                const token = jwt.sign(payload, "secret $tash");
                if (foundUser.signupDate !== undefined) {
                    signupDate = foundUser.signupDate;
                    planType = foundUser.planType || "NONE";
                    isRegistered = true;
                    loggedIn = true;
                } else {
                    signupDate = null;
                    planType = null;
                    isRegistered = true;
                    loggedIn = false;
                }
                res.send({
                    status: 200,
                    data: foundUser,
                    token: token,
                    loggedIn: loggedIn,
                    isRegistered: isRegistered,
        
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
            console.log("no user")
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
  
router.post('/:id/admin/create', async (req, res) => {
    try {
        const foundUser = await User.findById(req.params.id);
        console.log('is owner? ' + foundUser.owner);
        if (foundUser.owner) {
            console.log('Already an admin.')
        } else {
            foundUser.owner = true;
            foundUser.save();
        }
        res.send({
            status: 200,
            data: foundUser,
        })
    } catch (err) {
        console.log('err')
        res.sendStatus(500);
    }
});
  
module.exports = router;