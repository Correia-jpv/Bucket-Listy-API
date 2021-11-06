/**
 * Express router providing Item related routes
 * @module ItemRouter
 * @requires express
 * @requires ItemController Item related CRUD operations
 */
module.exports = app => {
  /**
   * ItemController module
   * @const
   */
  const items = require("../controllers/item.controller.js")

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
   * Create a new Item
   * @name post/create
   * @see module:ItemController~create
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.post("/", items.create);

  /**
   * Retrieve all Items
   * @name get/findAll
   * @see module:ItemController~findAll
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/", items.findAll);

  /**
   * Delete all Items
   * @name delete/deleteAll
   * @see module:ItemController~deleteAll
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.delete("/", items.deleteAll);

  /**
   * Retrieve a single Item with name
   * @name get/findOne
   * @see module:ItemController~findOne
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/:name", items.findOne);

  /**
   * Update a Item with name
   * @name put/update
   * @see module:ItemController~update
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.put("/:name", items.update);

  /**
   * Delete a Item with name
   * @name delete
   * @see module:ItemController~delete
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.delete("/:name", items.delete);

  /**
   * Retrieve a single Item with ID
   * @name get/findOneById
   * @see module:ItemController~findOneById
   * @function
   * @param {string} path Express path
   * @param {callback} middleware Express middleware.
   */
  router.get("/id/:id", items.findOneById);

  app.use('/api/items', router);
};