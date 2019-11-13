const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const withAuth = require("../middleware/authToken");
const secret = "secret $tash";
// router.get("/register", (req, res) => {
//     res.render("auth/register.ejs", {
//         user: null
//     });
// });

// router.get("/login", (req, res) => {
//     res.render("auth/login.ejs", {
//         message: req.session.message,
//         user: null
//     });
// });

router.get("/test", (req, res) => {
    res.status(200).send("Test passes - server on.");
})

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
        console.log("got here")
        console.log(req.body)
        const password = req.body.password;
        console.log(password + " ");
        const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
        console.log(password + " " + passwordHash);
        // Create an object to put into our database into the User Model
        const userEntry = {};
        userEntry.password = passwordHash;
        userEntry.email = req.body.email.toLowerCase();
        userEntry.name = req.body.name;
        const user = await User.create(userEntry);
        user.save();
        // initializing the session here
        req.session.username = req.body.username;
        req.session.name = req.body.name;
        req.session.logged   = true;
        req.session.message  = '';
        req.session.userId = user._id;
        console.log(userEntry);
        res.send({
            status: 200,
            data: userEntry   
        });
        console.log("done registered");
    } catch(err) {
        console.log(err);
    }
});
  
  
router.post('/login', async (req, res) => {
    console.log("TRYING LOGIN")
    const {email, password } = req.body
    //first query the database to see if the user exists
    try {
        const foundUser = await User.findOne({email: req.body.email.toLowerCase()});
        if(foundUser){
            if(bcrypt.compareSync(req.body.password, foundUser.password)){
                // req.session.logged = true;
                // req.session.email = foundUser.email;
                // req.session.name = foundUser.name;
                // req.session.userId = foundUser._id;
                const payload = foundUser.email;
                const token = jwt.sign(payload, "secret $tash");
                // res.cookie('token', token, {httpOnly: true})
                //     .sendStatus(200)
                console.log("here's the user: ", foundUser.email);
                console.log("here's the id: ", foundUser._id);
                res.send({
                    status: 200,
                    data: foundUser,
                    token: token
                })
                console.log("done logged in")
            } else {
                req.session.message = 'Username or Password is Wrong';
            }
    } else {
            req.session.message = 'Username or Password is Wrong';
            // res.redirect('/auth/login');
    } // end of foundUser
    } catch(err) {
        console.log(err);
        res.send(err);
    }
});

// router.get("/cookie", async (req, res) => {
//     if(req.session.logged){
//         const user = await User.findById(req.session.userId);
//         if(user.password = req.session.hashedPass)
//         const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
//     }
// })
  
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