const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");
const checkForToken = require("../middleware/authToken");
const jwt = require('jsonwebtoken');
const secret = "secret $tash";


withAuth = async (req, res) => {
  const token = req.headers["authorization"];
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

router.get("/:email", checkForToken, async (req, res) => {
  const allContacts = await Contact.find({user: req.params.email});
  // console.log("contacts: ", allContacts);
  res.json({
      status: 200,
      message: "Incoming contacts",
      data: allContacts
  })
});

router.post("/new", checkForToken, async (req, res) => {
  console.log(req.body)
  var submittedContact = req.body;
  var today = new Date(); //Today's Date
  projectedDate = async (addedTime) => {
      return new Date(today.getFullYear(),today.getMonth(),today.getDate()+ addedTime);
  }
  submittedContact["stage"] = 1;
  submittedContact["firstReminder"] = await projectedDate(parseInt(submittedContact.firstReminder) * parseInt(submittedContact["firstReminderInterval"]));
  submittedContact["secondReminder"] = await projectedDate(parseInt(submittedContact.secondReminder) * parseInt(submittedContact["secondReminderInterval"]));
  if(submittedContact.thirdReminder){
      submittedContact["thirdReminder"] = await projectedDate(parseInt(submittedContact.thirdReminder) * parseInt(submittedContact["thirdReminderInterval"]));
  }
  if(submittedContact.fourthReminder){
      submittedContact["fourthReminder"] = await projectedDate(parseInt(submittedContact.fourthReminder) * parseInt(submittedContact["fourthReminderInterval"]));
  }
  submittedContact["repeatingReminderRhythm"] = await parseInt(submittedContact.repeatingReminder);
  submittedContact["repeatingReminder"] = await projectedDate(parseInt(submittedContact.repeatingReminder) * parseInt(submittedContact["repeatingReminderRhythm"]));
  console.log("NEW USER????")
  const dog = await withAuth(req, res)
  console.log("WHAT'S THE EMAIL??", req.email);
  console.log("this dog: ", dog);
  submittedContact["user"] = req.email;
  console.log("THAT WAS THE USER");
  const newContact = await Contact.create(submittedContact);
  newContact.save();
  console.log("check for new contact: ", newContact);
  res.header(
      {"Access-Control-Allow-Origin": "*"}
  )
  res.json({
      status: 200,
      message: "post request successful",
      data: newContact
  });
})

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