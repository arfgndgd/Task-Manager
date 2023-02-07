const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

//JWT Secret
const jwtSecret = ""

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: String,
            required: true
        }
    }]
})

// INSTANCE METHODS 
UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    // return the document except the password and sessions (these shouldn't be made awailable)
   return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JWT and return that
        twt.sign({ _id: user._id.toHexString() }, )
    })
}