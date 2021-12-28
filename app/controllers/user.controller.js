/**
 * User related CRUD operations
 * @module UserController
 * @see User
 */

const db = require("../models"),
  User = db.users,
  Item = db.items,
  {
    PUBLIC_API_KEY,
    MASTER_API_KEY,
    API_KEY_LOGIN_RADIUS,
    API_SECRET_LOGIN_RADIUS,
    SITE_NAME
  } = process.env,
  config = {
    apiDomain: 'api.loginradius.com',
    apiKey: API_KEY_LOGIN_RADIUS,
    apiSecret: API_SECRET_LOGIN_RADIUS,
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

/**
 * **Create a new User**
 * 
 * with the auth ID token and name(optional) from the request's body
 * @function create
 * @param {Object} req POST request
 * @param {Object} req.body request's body
 * @param {Number} req.body.idToken user's auth ID token
 * @param {string|undefined} [req.body.name] user's name
 * 
 * @param {Object} res response
 * @param {User} res.user created User
 */
exports.create = (req, res) => {
  // Validate authentication and authorization
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    res
      .status(401)
      .send({ message: "Missing authentication header" });
    return
  }
  if (apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  // Validate request parameters
  if (!req.body.idToken) {
    res
      .status(400)
      .send({ message: "Request is missing required parameters" });
    return;
  }

  // Create a User
  const name = sanitizeHtml(req.body.name),
    token = sanitizeHtml(req.body.idToken),
    user = new User({
      name: name,
      idToken: token
    })

  // Save User in the database
  user.save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error creating User` });
    });
};

/**
 * **Retrieve all Users**
 * @function findAll
 * @param {Object} req GET request
 * 
 * @param {Object} res response
 * @param {User[]} res.data list of users
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
  if (apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  // Get query string from the Request and consider it as condition for findAll() method.
  const title = sanitizeHtml(req.query.title),
    condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {}

  User.find(condition, { __v: 0 })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving all Users` });
    });
};

/**
 * **Delete all Users**
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

  User.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Users were deleted successfully`
      });
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error deleting all Users` });
    });
};

/**
 * **Find User by auth ID token**
 * 
 * with the auth ID token in the request's path
 * @function findByIdToken
 * @param {Object} req POST request
 * @param {Object} req.params request's path parameters
 * @param {Number} req.params.idToken user's auth ID token
 * 
 * @param {Object} res response
 * @param {User} res.data found user
 */
exports.findByIdToken = async(req, res) => {
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

  const token = sanitizeHtml(req.params.token),
    profile = await getLoginRadiusProfile(token)

  if (profile) {
    const uid = profile["ID"],
      name = profile["FullName"];

    User.findOne({ idToken: uid }, { __v: 0 })
      .then(async data => {
        if (!data) {
          req.body.name = name;
          req.body.idToken = uid;
          this.create(req, res)
        } else
          res.send(data);
      })
      .catch(err => {
        res
          .status(404)
          .send({ message: `User with ID token '${token}' was not found` });
      });
  } else
    res
    .status(500)
    .send({ message: `Error retrieving User with ID token '${token}'` });
};

/**
 * **Find a single User by ID**
 * 
 * with the ID in the request's path
 * @function findOne
 * @param {{params: {id: string}}} req GET request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.id user's ID
 * 
 * @param {Object} res response
 * @param {User} res.data found user
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

  const id = sanitizeHtml(req.params.id);

  User.findById(id, { __v: 0 })
    .then(data => {
      if (!data)
        res
        .status(404)
        .send({ message: `User with ID '${id}' was not found` });
      else
        res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving User with ID '${id}'` });
    });
};

/**
 * **Update a User by ID**
 * 
 * with the ID in the request's path and the user's details from the request's body
 * @function update
 * @param {Object} req PUT request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.id user's ID
 * @param {Object} req.body request's body
 * @param {Number|undefined} [req.body.idToken] user's auth ID token
 * @param {string|undefined} [req.body.name] user's name
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
    res.status(400).send({
      message: "Request is missing required parameters"
    });
    return
  }

  const id = sanitizeHtml(req.params.id);

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false }, { __v: 0 })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Can't update User with ID '${id}'. User may not exist`
        });
      } else res.send({ message: "User was updated successfully" });
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error updating User with ID '${id}'` });
    });
};

/**
 * **Delete a User by ID**
 * 
 * with the ID in the request's path
 * @function delete
 * @param {Object} req DELETE request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.id user's ID
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
  if (apiKey !== PUBLIC_API_KEY && apiKey !== MASTER_API_KEY) {
    res
      .status(403)
      .send({ message: "You have no authorization to complete this operation" });
    return
  }

  const id = sanitizeHtml(req.params.id);

  User.findByIdAndRemove(id)
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Can't delete User with ID '${id}'. User may not exist`
        });
      } else {
        res.send({
          message: "User was deleted successfully"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Error deleting User with ID '${id}'`
      });
    });
};

/**
 * **Add an Item to a User's bucket list**
 * 
 * with the user's auth token from the request's path
 * 
 * and the item's name and checked status from the request's body
 * @function addItemToUser
 * @param {Object} req POST request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.user user's auth token
 * @param {Object} req.body request's body
 * @param {string} req.body.item item's name
 * @param {boolean|undefined} [req.body.checked] item's checked status
 * 
 * @param {Object} res response
 * @param {string} res.message message
 */
exports.addItemToUser = async(req, res) => {
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
  if (!req.body.item) {
    res
      .status(400)
      .send({ message: "Request is missing required parameters" });
    return
  }

  const user = sanitizeHtml(req.params.user),
    itemName = sanitizeHtml(req.body.item),
    itemChecked = sanitizeHtml(req.body.checked),
    profile = await getLoginRadiusProfile(user),
    uid = profile["ID"]

  // Verify if item already exists in DB
  let item = await Item.findOne({ "name": itemName }),
    userHasItem;

  if (!item) {
    // Item doesn't exist yet so we create it
    const newItem = new Item({
      name: itemName
    });
    await newItem.save(newItem);

    // Retrieve the Item we just created to get its details
    // And add it to the User's bucket list
    item = await Item.findOne({ "name": itemName });
  } else {
    // Item already exists so we check if the User already has is on their bucket list
    userHasItem = await User.findOne({ "idToken": uid, "items.item": item._id });
    if (userHasItem) {
      res
        .status(403)
        .send({
          message: `User already has Item '${itemName}'`
        });
    }
  }

  // Add Item to the User's bucket list
  if (!userHasItem) {
    User.updateOne({ "idToken": uid }, { $push: { items: { item: item._id, checked: itemChecked } } }, { new: true, useFindAndModify: false })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Can't add Item '${itemName}' to the User. User may not exist`
          });
        } else res.send({ message: `Item '${itemName}' was added to the User successfully` });
      })
      .catch(err => {
        res.status(500).send({
          message: `Error adding Item '${itemName}' to the User`
        });
      });
  }
};

/**
 * **Update an item from a User with token**
 * 
 * with the user's auth ID token and the item's name on the request's path
 * 
 * and the item's checked status on the request's body
 * @function updateItemFromUser
 * @param {Object} req PUT request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.user user's auth token
 * @param {string} req.params.item item's name
 * @param {Object} req.body request's body
 * @param {boolean} req.body.checked item's checked status
 * 
 * @param {Object} res response
 * @param {string} res.message message
 */
exports.updateItemFromUser = async(req, res) => {
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

  const user = sanitizeHtml(req.params.user),
    itemName = sanitizeHtml(req.params.item),
    itemChecked = sanitizeHtml(req.body.checked),
    profile = await getLoginRadiusProfile(user),
    uid = profile["ID"],
    item = await Item.findOne({ "name": itemName })

  if (item) {
    User.updateOne({ "idToken": uid, "items.item": item._id }, { "$set": { "items.$.checked": itemChecked } })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Can't update Item '${itemName}' from the User. User may not exist`
          });
        } else res.send({ message: `Item '${itemName}' from the User was updated successfully` });
      })
      .catch(err => {
        res.status(500)
          .send({ message: `Error updating Item '${item}' from the User` });
      });
  }
}

/**
 * **Delete an item from a User with token**
 * 
 * with the user's auth ID token and the item's name on the request's path
 * @function deleteItemFromUser
 * @param {Object} req DELETE request
 * @param {Object} req.params request's path parameters
 * @param {string} req.params.user user's auth token
 * @param {string} req.params.item item's name
 * 
 * @param {Object} res response
 * @param {string} res.message message
 */
exports.deleteItemFromUser = async(req, res) => {
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

  const user = sanitizeHtml(req.params.user),
    itemName = sanitizeHtml(req.params.item),
    profile = await getLoginRadiusProfile(user),
    uid = profile["ID"],
    item = await Item.findOne({ "name": itemName })

  if (item) {
    User.updateOne({ "idToken": uid }, { $pull: { items: { item: item._id } } })
      .then(data => {
        if (!data) {
          res.status(404).send({
            message: `Can't delete Item ${itemName} from the User. User may not exist`
          });
        } else res.send({ message: `Item '${itemName}' from the User was deleted successfully` });
      })
      .catch(err => {
        res.status(500).send({
          message: `Error deleting Item '${itemName}' from the User`
        });
      });
  }
};

/**
 * **Get User profile from Login Radius**
 * @function getLoginRadiusProfile
 * @param {string} token User's token
 * @returns {Object|null} User's profile
 */
async function getLoginRadiusProfile(token) {
  return await lrv2.authenticationApi.getProfileByAccessToken(token)
    .then(data =>
      (!data) ? null : data["Identities"][0]
    )
    .catch((error) => null);
}