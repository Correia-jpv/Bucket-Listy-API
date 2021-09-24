const db = require("../models"),
  User = db.users,
  Item = db.items,
  {
    API_KEY,
    API_SECRET,
    SITE_NAME
  } = process.env,
  config = {
    apiDomain: 'api.loginradius.com',
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    siteName: SITE_NAME,
    apiRequestSigning: false,
    proxy: {
      host: '',
      port: '',
      user: '',
      password: ''
    }
  },
  lrv2 = require('loginradius-sdk')(config);

// Create and Save a new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body.idToken) {
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
        message: err.message || "Some error occurred while creating user."
      });
    });
};

// Retrieve all Users
exports.findAll = (req, res) => {
  const name = req.query.name;
  let condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};

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

// Update a User with the id in the request
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

// Add an item to a User with token
exports.addItemToUser = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to add item can not be empty!"
    });
  }

  const user = req.params.user;
  const itemChecked = req.body.checked;
  const itemName = req.body.item;

  // Verify if item already exists in DB or add it to DB. If it exists then check if user already has it  

  let item = await Item.findOne({ "name": itemName }),
    itemExists;

  if (!item) {
    const newItem = new Item({
      name: itemName
    });
    await newItem.save(newItem);

    item = await Item.findOne({ "name": itemName });
  } else {
    itemExists = await User.findOne({ "idToken": user }, { "items.item": item._id });

    if (itemExists) {
      res.status(200).send({
        message: `User ${user} already has item ${item.name}`
      });
    }
  }

  if (!itemExists) {
    User.updateOne({ "idToken": user }, { $push: { items: { item: item._id, checked: itemChecked } } }, { new: true, useFindAndModify: false })
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
  }
};

// Update an item from a User with token
exports.updateItemFromUser = async(req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const user = req.params.user;
  const itemName = req.params.item;
  const itemChecked = req.body.checked;

  let item = await Item.findOne({ "name": itemName })

  if (item) {
    User.updateOne({ "idToken": user, "items.item": item._id }, { "$set": { "items.$.checked": itemChecked } })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update Item ${itemName} from User ${user}.`
          });
        } else res.send({ message: "User's Item was updated successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: `Error updating Item ${item} from User ${user}.`
        });
      });
  } else {
    res.status(404).send({
      message: `Cannot update Item ${itemName} from User ${user}. Item not found`
    });
  }
}

// Delete an item from a User with token
exports.deleteItemFromUser = async(req, res) => {
  const user = req.params.user;
  const itemName = req.params.item;

  let item = await Item.findOne({ "name": itemName })
  if (item) {
    User.updateOne({ "idToken": user }, { $pull: { items: { item: item._id } } })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot delete Item ${itemName} from User ${user}.`
          });
        } else res.send({ message: "User's Item was deleted successfully." });
      })
      .catch(err => {
        res.status(500).send({
          message: `Error deleting Item ${itemName} from User ${user}.`
        });
      });
  } else {
    res.status(404).send({
      message: `Cannot delete Item ${itemName} from User ${user}. Item not found`
    });
  }
};

// Find User by Google Signin id Token
exports.findByIdToken = async(req, res) => {
  const token = req.params.token;

  let profile = await getLoginRadiusProfile(token)
  if (profile) {
    const uid = profile["ID"],
      name = profile["FullName"];

    User.findOne({ idToken: uid })
      .then(async data => {
        if (!data || data.length == 0) {
          req.body.name = name;
          req.body.idToken = uid;
          this.create(req, res)
        } else res.send(data);
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving User with id " + uid });
      });
  } else res
    .status(500)
    .send({ message: "Error retrieving User with idToken " + token });
};

async function getLoginRadiusProfile(token) {
  return await lrv2.authenticationApi.getProfileByAccessToken(token)
    .then(data => {
      if (!data) {
        return null
      } else {
        const profile = data["Identities"][0];
        return profile
      }
    })
    .catch((error) => {
      return null
    });
}