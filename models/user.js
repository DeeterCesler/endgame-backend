const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: ({type: String, required:true}),
    password: ({type: String, required: true}),
    email: ({type: String, required:true}),
    owner: {type: Boolean, default: false},
    groupAdmin: Boolean,
    planType: String,
    numberOfCalls: {
        total: {type: Number, default: 0},
        details: Object,
    },
})

module.exports = mongoose.model('User', userSchema);