const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;

// Item model
db.items = require("./item.model.js")(mongoose);

// User model
db.users = require("./user.model.js")(mongoose);

module.exports = db;