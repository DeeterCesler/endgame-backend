const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    userId: {required: true, type: String},
    layerOne: {required: true, type: Object},
    numberOfCalls: {
        total: {type: Number, default: 0},
        details: Object,
    },
})

module.exports = mongoose.model('Route', routeSchema);