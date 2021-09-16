module.exports = app => {
  const users = require("../controllers/user.controller.js");

  var router = require("express").Router();

  // Create a new User
  router.post("/", users.create);

  // Retrieve all Users
  router.get("/", users.findAll);

  // Retrieve a single User with id
  router.get("/:id", users.findOne);

  // Update a User with id
  router.put("/:id", users.update);

  // Delete a User with id
  router.delete("/:id", users.delete);

  // Delete all Users
  router.delete("/", users.deleteAll);

  // Add an item to a User with id
  router.post("/:user", users.addItemToUser);

  // Update an Item from a User with id
  router.put("/:user/:item", users.updateItemFromUser);

  // Delete an Item from a User with id
  router.delete("/:user/:item", users.deleteItemFromUser);

  // Find User by Google Signin id Token
  router.get("/token/:token", users.findByIdToken);

  app.use('/api/users', router);
};