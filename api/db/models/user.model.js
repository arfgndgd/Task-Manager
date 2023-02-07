const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//JWT Secret
const jwtSecret = "25212984996786876417@kphuqumetiYargıl@nmalı9386918809";

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
    // şifre ve oturumlar dışında belgeyi döndür (bunlar kullanılabilir yapılmamalı)
   return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JWT and return that
        twt.sign({ _id: user._id.toHexString() }, jwtSecret, {expiresIn: "15m"}, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                reject();
            }
        } )
    })
}

UserSchema.methods.generateRefreshAuthToken = function() {
    // This method simply generates a 64bytes hex string - it doesn't save it to the database. saveSessionToDatabase() does that
    // Bu yöntem basitçe 64 baytlık bir onaltılık dize oluşturur - onu veritabanına kaydetmez. saveSessionToDatabase() bunu yapar
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');
                return resolve(token);
            }
        })
    })
}

UserSchema.methods.createSession = function() {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        // saved to database successfully
        // now return the refresh token
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    })
}

/* MODEL METHODS (static methods) */
UserSchema.statics.findByIdAndToken = function(_id, token) {
    // finds user by id and token
    // used in auth middleware (verifySession)

    const user = this;
    return user.findOne({
        _id,
        'session.token': token
    });
}

/* HELPER METHODS */
let saveSessionToDatabase = (user, refreshToken) => {
    // Save session to Database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({ 'token': refreshToken, expiresAt });

        user.save().then(() => {
            // saved session successfuly
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        })
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}