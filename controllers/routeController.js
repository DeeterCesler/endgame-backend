const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const User = require("../models/user")
const Route = require("../models/route")
const checkForToken = require("../middleware/authToken");
const jwt = require('jsonwebtoken');
const secret = "secret $tash";

router.get('/favicon.ico', (req, res) => res.sendStatus(204));

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
  // check for blank values
  if (!req.body.endpointName || !req.body.endpointValue) {
    res.send({
      status: 500,
      message: "Blank value(s) submitted."
    })
  }

  const newRoute = {};
  newRoute.userId = foundUser._id;
  newRoute["layerOne"] = {[req.body.endpointName]: req.body.endpointValue};


  let rootLayer = req.body.endpointName
  // Finding all routes associated with a user
  const routes = await Route.find({userId: foundUser.id});

  let route = null;
  if (routes.length) {
    console.log('here')
    for(let i=0; i<routes.length;i++){
      console.log('okayyyy ' + JSON.stringify(routes[i].layerOne))
      if(routes[i].layerOne[rootLayer]){
        console.log('SAME ROUTE UWU');
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
})

// Get all the users' endpoints
router.get("/all", async (req, res) => {
  await withAuth(req, res) // this sets req.email to the user email
  console.log("WHAT'S THE EMAIL??", req.email); // this is for testing/debugging purposes
  const foundUser = await User.findOne({email: req.email});
  const foundRoutes = await Route.find({userId: foundUser._id})
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: foundRoutes
  });
})

// Posting/creating a route
router.post("/:id/:layerOne?/:layerTwo?/:layerThree?", async (req, res) => {
  console.log('is this shit literally ever hit??')
  const user = await User.findById(req.params.id);
  console.log("USER: " + user["name"]);
  //parses through string and makes an array out of every set of characters 
  const layerOne = req.params.layerOne
  // const layerTwo = req.params.layerTwo
  // const layerThree = req.params.layerThree

  const routes = await Route.find({userId: req.params.id});
  for(let i=0; i<routes.length;i++){
    if(routes[i].layerOne[req.params.layerOne] != null){
      route = routes[i]
    }
  }
  console.log("ROUTE: " + route)
  console.log("LAYER ONE: " + route.layerOne[req.params.layerOne])
  res.json({
    id: req.params.id,
    [req.params.layerOne]: route.layerOne[req.params.layerOne]
  })
});

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
  
  let route = null;
  // Choosing the route of the submitted name
  if (routes) {
    for(let i=0; i<routes.length;i++){
      if(routes[i].layerOne[rootLayer]){
        route = routes[i]
      }
    }
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