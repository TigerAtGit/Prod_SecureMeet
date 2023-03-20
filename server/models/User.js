const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: false},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    lastIp: {type: String, required: false},
});

module.exports = mongoose.model("User", UserSchema);