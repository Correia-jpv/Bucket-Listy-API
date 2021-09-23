const db = require("../models");
const Item = db.items;

// Create and Save a new Item
exports.create = (req, res) => {
  // Validate request
  if (!req.body.name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Item
  const item = new Item({
    name: req.body.name
  });

  // Save Item in the database
  item
    .save(item)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Item."
      });
    });
};

// Retrieve all Items
exports.findAll = (req, res) => {
  const item = req.query.name;
  var condition = item ? { name: { $regex: new RegExp(item), $options: "i" } } : {};

  Item.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving items."
      });
    });
};

// Find a single Item by id
exports.findOneById = (req, res) => {
  const item = req.params.id;

  Item.findOne({ "_id": item })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Item with id " + item });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Item with id =" + item });
    });
};

// Find a single Item with an name
exports.findOne = (req, res) => {
  const item = req.params.name;

  Item.find({ "name": item })
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Item with name " + item });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Item with name =" + item });
    });
};

// Update an Item by the name in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const item = req.params.name;

  Item.findBynameAndUpdate(item, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Item with name =${item}. Maybe Item was not found!`
        });
      } else res.send({ message: "Item was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Item with name =" + item
      });
    });
};

// Delete an Item with the name in the request
exports.delete = (req, res) => {
  const item = req.params.name;

  Item.findBynameAndRemove(item)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Item with name=${item}. Maybe Item was not found!`
        });
      } else {
        res.send({
          message: "Item was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Item with name=" + item
      });
    });
};

// Delete all Items
exports.deleteAll = (req, res) => {
  Item.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Items were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Items."
      });
    });
};

// Find all Items with any category
exports.findAllPublished = (req, res) => {
  Item.find({ category: '*' })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Items."
      });
    });
};