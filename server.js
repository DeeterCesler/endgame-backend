const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const contactController = require("./controllers/contactsController");
const userController = require("./controllers/usersController");
const authController = require("./controllers/authController")
const generalController = require("./controllers/generalController")
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const requireLogin = require("./middleware/requireLogin");
const checkForToken = require("./middleware/authToken");
require('./db/db');
require("dotenv").config();

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions'
});

store.on('connected', function() {
    store.client; // The underlying MongoClient object from the MongoDB driver
});
   
  // Catch errors
store.on('error', function(error) {
    console.log(error);
});

const corsOptions = {
    origin: process.env.REACT_APP_ADDRESS || "http://localhost:3001",
    // allowedHeaders: "*",
    // requestHeaders: "*",
    // credentials: true,
    optionsSuccessStatus: 200 
  }
  
// Middleware
app.use(cors(corsOptions));
// https redirect
if(process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.header('x-forwarded-proto') !== 'https')
        res.redirect(`https://${req.header('host')}${req.url}`)
      else
        next()
    })
}

app.use((req, res, next) => {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
  }
)
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'secret $tash',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    // Boilerplate options, see:
    // * https://www.npmjs.com/package/express-session#resave
    // * https://www.npmjs.com/package/express-session#saveuninitialized
    resave: true,
    saveUninitialized: true
}));
app.use(async (req, res, next) => {
    res.locals.user = req.session.userId || {};
    next();
})

// Routing
app.use("/contact", contactController);
app.use("/auth", authController);
app.use("/user", requireLogin, userController);
app.use("/", generalController);


const port = process.env.PORT || "3000"
app.listen(port, () => {
    console.log(`LIVE @ ${port}`);
})