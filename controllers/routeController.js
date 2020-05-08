const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const User = require("../models/user")
const Route = require("../models/route")
const checkForToken = require("../middleware/authToken");
const jwt = require('jsonwebtoken');
const secret = "secret $tash";

withAuth = async (req, res) => {
  const token = req.headers["authorization"];
  console.log(token)
  if (!token || token === null) {
    res.status(401).send("Unauthorized: No token provided");
  } else {
    await jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded;
      }
    });
  }
}

router.post("/new", async (req, res) => {
  await withAuth(req, res) // this sets req.email to the user email
  const foundUser = await User.findOne({email: req.email});
  if (foundUser.signupDate) {
    // Check user plan type
    // const planType = foundUser.planType;
    // switch (planType) {
    //   case "loneWolf":
    //     shite;
    //     break;
    //   case "startup":
    //     shite2;
    //     break;
    //   case "enterprise":
    //     shite3;
    //     break;
    // }
  
    // check for blank values
    if (!req.body.endpointName || !req.body.endpointValue) {
      res.send({
        status: 500,
        message: "Blank value(s) submitted."
      })
    }
    // Check for data length (to prevent system abuse)
    if (JSON.stringify(req.body.endpointValue).length > 2000) {
      console.log('too long jones')
      res.send({
        status: 500,
        message: "JSON message must be fewer than 2,000 characters."
      })
    } else {
      const newRoute = {};
      newRoute.userId = foundUser._id;
      newRoute["layerOne"] = {[req.body.endpointName]: req.body.endpointValue};
    
    
      let rootLayer = req.body.endpointName
      // Finding all routes associated with a user
      const routes = await Route.find({userId: foundUser.id});
    
      let route = null;
      if (routes.length) {
        for(let i=0; i<routes.length;i++){
          if(routes[i].layerOne[rootLayer]){
            route = routes[i]
          }
        }
      }
      
      if (route !== null) {
        console.log('Found route with same name, updating.')
        savedRoute = await Route.findByIdAndUpdate(route._id, newRoute)
      }
      else {
        console.log('Creating new route.')
        savedRoute  = await Route.create(newRoute);
      }
      res.header(
        {"Access-Control-Allow-Origin": "*"}
      )
      res.json({
        status: 200,
        message: "post request successful",
        data: savedRoute
      });
    }
  } else {
    res.json({
      status: 403,
      message: "Only users with plans can create routes.",
    });
  }
})

// Get all the users' endpoints
router.get("/all", async (req, res) => {
  await withAuth(req, res) // this sets req.email to the user email
  console.log("WHAT'S THE EMAIL??", req.email); // this is for testing/debugging purposes
  let foundUser;
  try {
    foundUser = await User.findOne({email: req.email});
  } catch(err) {
    console.log('No user with plan found. Err: ' + err);
    res.json({
      status: 500,
      message: "No user with plan found.",
  })};
  if(foundUser.signupDate) {
    const foundRoutes = await Route.find({userId: foundUser._id})
    res.header(
      {"Access-Control-Allow-Origin": "*"}
    )
    res.json({
        status: 200,
        message: "post request successful",
        data: foundRoutes
    });
  } else {
    res.json({
      status: 403,
      message: "User is registered, but hasn't actually subscribed to a plan yet.",
    });
  }
})

// Getting requested route
router.get("/:id/:submittedLayerOne?/:submittedLayerTwo?/:submittedLayerThree?/:submittedLayerFour?/:submittedLayerFive?", async (req, res) => {
  //parses through request params and concatentates the route name
  let rootLayer = req.params.submittedLayerOne
  if(req.params.submittedLayerTwo){
    rootLayer = rootLayer + "/" + req.params.submittedLayerTwo
    if(req.params.submittedLayerThree){
      rootLayer = rootLayer + "/" + req.params.submittedLayerThree
      if(req.params.submittedLayerFour){
        rootLayer = rootLayer + "/" + req.params.submittedLayerFour
        if(req.params.submittedLayerFive){
          rootLayer = rootLayer + "/" + req.params.submittedLayerFive
        }
      }
    }
  }
  // Finding all routes associated with a user
  const routes = await Route.find({userId: req.params.id});
  const user = await User.findById(req.params.id);
  
  let route = null;
  // Choosing the route of the submitted name
  if (routes) {
    for(let i=0; i<routes.length;i++){
      if(routes[i].layerOne[rootLayer]){
        route = routes[i]
      }
    }
  }
  
  if (route) {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    // Establishing route count object(s)
    if (route.numberOfCalls === undefined) {
      console.log('creating record of calls')
      route.numberOfCalls = {};
    }
    if (route.numberOfCalls.details === undefined) {
      console.log('creating route details')
      route.numberOfCalls.details = {};
    }
    if (route.numberOfCalls.details[thisYear] === undefined) {
      console.log('creating year')
      route.numberOfCalls.details[thisYear] = {};
    }
    if (route.numberOfCalls.details[thisYear][thisMonth] === undefined) {
      route.numberOfCalls.details[thisYear][thisMonth] = 0;
      console.log('creating month')
    }

    // Establishing user count object(s)
    if (user.numberOfCalls === undefined) {
      console.log('creating user record of calls')
      user.numberOfCalls = {};
    }
    if (user.numberOfCalls.details === undefined) {
      console.log('creating user details')
      user.numberOfCalls.details = {};
    }
    if (user.numberOfCalls.details[thisYear] === undefined) {
      console.log('creating user year')
      user.numberOfCalls.details[thisYear] = {};
    }
    if (user.numberOfCalls.details[thisYear][thisMonth] === undefined) {
      user.numberOfCalls.details[thisYear][thisMonth] = 0;
      console.log('creating user month')
    }


    ++route.numberOfCalls.details[thisYear][thisMonth];
    ++user.numberOfCalls.details[thisYear][thisMonth];

    route.markModified('numberOfCalls.details');
    user.markModified('numberOfCalls.details');

    ++route.numberOfCalls.total;
    ++user.numberOfCalls.total;

    await route.save();
    await user.save();
  }
  
  if (route === null) {
    res.json({
      id: req.params.id,
      data: "No routes available with that user ID."
    })
  } else {
    res.json({
      id: req.params.id,
      data: route.layerOne[rootLayer]
    })
  }
});

router.delete("/:id", checkForToken, async (req, res) => {
  await withAuth(req, res) // this sets req.email to the user email
  console.log("WHAT'S THE EMAIL??", req.email); // this is for testing/debugging purposes
  const foundUser = await User.findOne({email: req.email});
  const foundRoute = await Route.findOne({userId: foundUser._id})
  if(foundRoute){
    if(foundRoute.numberOfCalls)
    await Route.findByIdAndDelete(req.params.id);
    res.json({
        status: 200,
        message: "route successfully deleted"
    })
  } else {
    res.json({
      status: 403,
      message: "Only the user who created the route may delete it. If that's you, please make sure you're logged in."
    })
  }
})

module.exports = router;