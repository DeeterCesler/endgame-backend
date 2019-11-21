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
  console.log("VALUE: " + req.body.endpointValue)
  const shit = await withAuth(req, res) // this sets req.email to the user email
  const foundUser = await User.findOne({email: req.email});
  // if that endpoint already exists, overwrite it
  const newRoute = {};
  newRoute.userId = foundUser._id;
  newRoute["layerOne"] = {[req.body.endpointName]: req.body.endpointValue};
  console.log(newRoute);
  // line 39 doesn't work yet, just returns null
  const routeWhichMayExist = await Route.findOne({layerOne: {[req.body.endpointName]: {$not: null}}})
  console.log("IS IT NULL? " + routeWhichMayExist);
  let savedRoute;
  if(routeWhichMayExist){
    // overwrite old routes
    savedRoute = await Route.findByIdAndUpdate(routeWhichMayExist._id, newRoute)
  }
  else {
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

// Get all the users endpoints
router.get("/all", async (req, res) => {
  console.log(req.headers)
  const shit = await withAuth(req, res) // this sets req.email to the user email
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

// Test route
router.post("/:id/:layerOne?/:layerTwo?/:layerThree?", async (req, res) => {
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
    //  layerTwo: layerTwo,
    //  layerThree: layerThree 
  })
});

router.get("/:id/:submittedLayerOne?/:submittedLayerTwo?/:submittedLayerThree?", async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log("USER: " + user["name"]);
  console.log("LAYER ONE: " + req.params.submittedLayerOne)
  console.log("LAYER TWO: " + req.params.layerTwo)
  //parses through string and makes an array out of every set of characters 
  let submittedLayerOne = req.params.submittedLayerOne
  const submittedLayerTwo = req.params.submittedLayerTwo
  const submittedLayerThree = req.params.submittedLayerThree
  if(req.params.submittedLayerTwo){
    submittedLayerOne = submittedLayerOne + "/" + submittedLayerTwo
    if(req.params.submittedLayerThree){
      submittedLayerOne = submittedLayerOne + "/" + submittedLayerThree
    }
  }
  console.log("NEW LAYER 'ONE': " + submittedLayerOne)
  // const layerThree = req.params.layerThree

  const routes = await Route.find({userId: req.params.id});
  for(let i=0; i<routes.length;i++){
    if(routes[i].layerOne[submittedLayerOne] != null){
      route = routes[i]
    }
  }
  console.log("ROUTE: " + route)
  console.log("LAYER ONE: " + route.layerOne[submittedLayerOne])
  res.json({
    id: req.params.id,
    data: route.layerOne[submittedLayerOne]
    //  layerTwo: layerTwo,
    //  layerThree: layerThree 
  })
});

router.put("/:id/edit", checkForToken, async (req, res) => {
  console.log(req.body)
  var submittedContact = req.body;
  var today = new Date(); //Today's Date
  projectedDate = async (addedTime) => {
      return new Date(today.getFullYear(),today.getMonth(),today.getDate()+ addedTime);
  }
  submittedContact["repeatingReminderRhythm"] = await parseInt(submittedContact.repeatingReminderRhythm);
  console.log(submittedContact.repeatingReminderRhythm, " and then ", submittedContact.repeatingReminder)
  submittedContact["repeatingReminder"] = await projectedDate(parseInt(submittedContact["repeatingReminderRhythm"]));
  const checkEmail = await withAuth(req, res)
  submittedContact["user"] = await req.email;
  console.log(await Contact.findById(req.params.id), " compared to " , submittedContact);
  const updatedContact = await Contact.findByIdAndUpdate(req.params.id,  submittedContact);
  updatedContact.save();
  console.log("updated contact: ", updatedContact);
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: updatedContact
  });
})

router.delete("/:id", checkForToken, async (req, res) => {
  const shit = await withAuth(req, res) // this sets req.email to the user email
  console.log("WHAT'S THE EMAIL??", req.email); // this is for testing/debugging purposes
  const foundUser = await User.findOne({email: req.email});
  const foundRoute = await Route.findOne({userId: foundUser._id})
  if(foundRoute){
    await Route.findByIdAndDelete(req.params.id);
    res.json({
        status: 200,
        message: "shit deleted"
    })
  } else {
    res.json({
      status: 403,
      message: "Only the user who created the route may delete it. If that's you, please make sure you're logged in."
    })
  }
})

module.exports = router;