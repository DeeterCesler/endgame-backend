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
  console.log(req.headers)
  const shit = await withAuth(req, res) // this sets req.email to the user email
  console.log("WHAT'S THE EMAIL??", req.email); // this is for testing/debugging purposes
  const foundUser = await User.findOne({email: req.email});
  console.log("USER & ID: " + foundUser + ", " + foundUser._id);
  const newRoute = {};
  newRoute.userId = foundUser._id;
  newRoute["layerOne"] = {[req.body.endpointName]: req.body.endpointValue};
  console.log(newRoute);
  const savedRoute  = await Route.create(newRoute);
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: savedRoute
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

router.get("/:id/:layerOne?/:layerTwo?/:layerThree?", async (req, res) => {
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
  await Contact.findByIdAndDelete(req.params.id);
  res.json({
      status: 200,
      message: "shit deleted"
  })
})

module.exports = router;