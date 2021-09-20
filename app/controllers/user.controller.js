const db = require("../models");
const User = db.users;

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.idToken) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a User
  const user = new User({
    name: req.body.name,
    idToken: req.body.idToken
  });

  // Save User in the database
  user
    .save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Item."
      });
    });
};

// Retrieve all Users
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving items."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found User with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving User with id " + id });
    });
};

// Update a Item with the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id ${id}. Maybe Item was not found!`
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating User with id " + id
      });
    });
};

// Delete a User with the id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id ${id}. Maybe User was not found!`
        });
      } else {
        res.send({
          message: "User was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete User with id " + id
      });
    });
};

// Delete all Users
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Users were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Users."
      });
    });
};

// Add an item to a User with id
exports.addItemToUser = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add item can not be empty!"
    });
  }

  const user = req.params.user;
  const itemChecked = req.body.checked;
  const item = { item: req.body.item, checked: itemChecked };


  User.update({ "idToken": user }, { $push: { items: item } }, { new: true })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot add Item ${item} to User ${user}.`
        });
      } else res.send({ message: "User's Item was added successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error adding Item ${item} to User ${user}.`
      });
    });
};

// Update an item from a User with id
exports.updateItemFromUser = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const user = req.params.user;
  const item = req.params.item;
  const itemChecked = req.body.checked;


  User.update({ "idToken": user, "items.item": item }, { "$set": { "items.$.checked": itemChecked } })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Item ${item} from User ${user}.`
        });
      } else res.send({ message: "User's Item was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error updating Item ${item} from User ${user}.`
      });
    });
}

// Delete an item from a User with id
exports.deleteItemFromUser = (req, res) => {
  const user = req.params.user;
  const item = req.params.item;


  User.update({ "idToken": user }, { $pull: { items: { item: item } } })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot add Item ${item} to User ${user}.`
        });
      } else res.send({ message: "User's Item was added successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error adding Item ${item} to User ${user}.`
      });
    });
};

// Find User by Google Signin id Token
exports.findByIdToken = (req, res) => {
  const token = req.params.token;

  User.find({ idToken: token })
    .then(data => {
      if (!data || data.length == 0)
        res.status(404).send({ message: "Not found User with idToken " + token });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving User with idToken " + token });
    });
};