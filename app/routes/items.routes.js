module.exports = app => {
  const items = require("../controllers/item.controller.js");

  var router = require("express").Router();

  // Create a new Item
  router.post("/", items.create);

  // Retrieve all Items
  router.get("/", items.findAll);

  // Retrieve a single Item with id
  router.get("/id/:id", items.findOneById);

  // Retrieve a single Item with name
  router.get("/:name", items.findOne);

  // Update a Item with name
  router.put("/:name", items.update);

  // Delete a Item with name
  router.delete("/:name", items.delete);

  // Delete all Items
  router.delete("/", items.deleteAll);

  app.use('/api/items', router);
};