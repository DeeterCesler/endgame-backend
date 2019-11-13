const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    user: {required: true, type: String},
    contactName: {required: true, type: String},
    contactEmail: {required: true, type: String},
    contactSummary: {required: true, type: String},
    firstReminder: Date,
    secondReminder: Date,
    thirdReminder: Date,
    fourthReminder: Date,
    repeatingReminder: Date,
    nextReminder: Date,
    firstReminderInterval: Number,
    secondReminderInterval: Number,
    repeatingReminderRhythm: Number,
    stage: Number, // 1-5, representing which reminder they're on. 5 is the final stage (for now)
})

module.exports = mongoose.model('Contact', contactSchema);