// This file will handle connection logic to MongoDB

const mongoose = require('mongoose');
mongoose.set("strictQuery", false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', { useNewUrlParser: true}).then(() => {
    console.log("Connected to MongoDB");
}).catch((e) => {
    console.log("Error connection to MongoDB");
    console.log(e);
});

// To prevent deprection warnings (from MongoDB native driver)
// mongoose.set('useCreateIndex', true);
// mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
}