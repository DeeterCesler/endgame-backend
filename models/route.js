const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    userId: {required: true, type: String},
    layerOne: {required: true, type: Object},
    layerTwo: Object,
    layerThree: Object,
    layerFour: Object,
    layerFive: Object,
})

module.exports = mongoose.model('Route', routeSchema);