/**
 * Item related CRUD operations
 * @module ItemController
 * @see Item
 */

const db = require("../models"),
  Item = db.items,
  {
    PUBLIC_API_KEY,
    MASTER_API_KEY
  } = process.env

/**
 * **Create a new Item**
 * 
 * with the name from the request's body
 * @function create
 * @param {Object} req POST request
 * @param {Object} req.body request's body
 * @param {string} req.body.name item's name
 * 
 * @param {Object} res response
 * @param {Item} res.item created Item
 */
exports.create = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  // Validate request parameters
  if (!req.body.name) {
    res
      .status(400)
      .send({ message: "Request is missing required parameters" });
    return;
  }

  // Create a Item
  const itemName = req.body.name,
    item = new Item({
      name: itemName
    });

  // Save Item in the database
  item
    .save(item)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error creating Item '${itemName}'` });
    });
};

/**
 * **Retrieve all Items**
 * @function findAll
 * @param {Object} req GET request
 * 
 * @param {Object} res response
 * @param {Item[]} res.data list of items
 */
exports.findAll = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  // Get query string from the Request and consider it as condition for findAll() method.
  const title = req.query.title,
    condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {}

  Item.find(condition, { __v: 0 })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving all Items` });
    });
};

/**
 * **Delete all Items**
 * @function deleteAll
 * @param {Object} req DELETE request
 * 
 * @param {Object} res response
 */
exports.deleteAll = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  Item.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Items were deleted successfully!`
      });
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error deleting all Items` });
    });
};

/**
 * **Find a single Item by name**
 * 
 * with the name in the request's path
 * @function findOne
 * @param {Object} req GET request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.name item's name
 * 
 * @param {Object} res response
 * @param {Item} res.data found item
 */
exports.findOne = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  const item = req.params.name;

  Item.find({ "name": item }, { __v: 0 })
    .then(data => {
      if (!data)
        res.status(404).send({ message: `Item with name '${item}' was not found` });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving Item with name '${item}'` });
    });
};

/**
 * **Update an Item by name**
 * 
 * with the name in the request's path
 * 
 * and the item's details in the request body
 * @function update
 * @param {Object} req PUT request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.name item's name
 * 
 * @param {Object} res response
 * @param {string} res.message message
 */
exports.update = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  // Validate request parameters
  if (!req.body) {
    res
      .status(400)
      .send({ message: "Request is missing required parameters" });
    return
  }

  const item = req.params.name;

  Item.findOneAndUpdate({ name: item }, req.body, { useFindAndModify: false }, { __v: 0 })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Can't update Item with name '${item}'. Item may not exist`
        });
      } else res.send({ message: "Item was updated successfully" });
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error updating Item with name '${item}'` });
    });
};

/**
 * **Delete an Item by name**
 * 
 * with the name in the request's path 
 * @function delete
 * @param {Object} req DELETE request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.name item's name
 * 
 * @param {Object} res response
 * @param {string} res.message message
 */
exports.delete = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  const item = req.params.name;

  Item.findOneAndRemove({ name: item })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Can't delete Item with name '${item}'. Item may not exist`
        });
      } else {
        res.send({
          message: "Item was deleted successfully"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Error deleting Item with name '${item}'`
      });
    });
};

/**
 * **Find a single Item by ID**
 * 
 * with the ID in the request's path
 * @function findOneById
 * @param {Object} req GET request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.id item's ID
 * 
 * @param {Object} res response
 * @param {Item} res.data found item
 */
exports.findOneById = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  const item = req.params.id;

  Item.findOne({ "_id": item }, { __v: 0 })
    .then(data => {
      if (!data)
        res
        .status(404)
        .send({ message: `Item with ID '${item}' was not found` });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving Item with ID '${item}'` });
    });
};

/**
 * **Retrieve all Items by the category**
 * 
 * with the category name in the request's path
 * @function findByCategory
 * @param {Object} req GET request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.category category name
 * 
 * @param {Object} res response
 * @param {Item[]} res.data list of items belonging to category
 */
exports.findByCategory = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return;
  }
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  const category = req.params.category

  Item.find({ "category": category }, { __v: 0 })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Items."
      });
    });
}