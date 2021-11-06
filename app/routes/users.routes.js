/**
 * Express router providing User related routes
 * @module UserRouter
 * @requires express
 * @requires UserController User related CRUD operations
 */
module.exports = app => {
  /**
   * UserController module
   * @const
   */
  const users = require("../controllers/user.controller.js")

  /**
   * express module
   * @const
   */
  const express = require("express")

  /**
   * Express router to mount Item related CRUD operations on.
   * @const 
   */
  const router = express.Router()


  /**
   * Create a new User
   * @name post/create
   * @see module:UserController~create
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.post("/", users.create);

  /**
   * Retrieve all Users
   * @name get/findAll
   * @see module:UserController~findAll
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/", users.findAll);

  /**
   * Delete all Users
   * @name delete/deleteAll
   * @see module:UserController~deleteAll
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.delete("/", users.deleteAll);

  /**
   * Retrieve User by social auth ID Token 
   * @name get/findByIdToken
   * @see module:UserController~findByIdToken
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/token/:token", users.findByIdToken);

  /**
   * Retrieve a single User with id 
   * @name get/findOne
   * @see module:UserController~findOne
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/:id", users.findOne);

  /**
   * Update a User with id 
   * @name put/update
   * @see module:UserController~update
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.put("/:id", users.update);

  /**
   * Delete a User with id 
   * @name delete/delete
   * @see module:UserController~delete
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.delete("/:id", users.delete);

  /**
   * Add an Item to a User with id 
   * @name post/addItemToUser
   * @see module:UserController~addItemToUser
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.post("/:user", users.addItemToUser);

  /**
   * Update an Item from a User with id
   * @name put/updateItemFromUser
   * @see module:UserController~updateItemFromUser
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.put("/:user/:item", users.updateItemFromUser);

  /**
   * Delete an Item from a User with id
   * @name delete/deleteItemFromUser
   * @see module:UserController~deleteItemFromUser
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.delete("/:user/:item", users.deleteItemFromUser);

  app.use('/api/users', router);
};