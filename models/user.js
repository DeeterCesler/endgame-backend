const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: ({type: String, required:true}),
    password: ({type: String, required: true}),
    email: ({type: String, required:true}),
    // contacts: [{type: mongoose.Schema.Types.ObjectId, ref: "Contacts"}]
})

module.exports = mongoose.model('User', userSchema);