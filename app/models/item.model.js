module.exports = mongoose => {
  const Item = mongoose.model(
    "item",
    mongoose.Schema({
      /**
       * @class
       * @alias Item
       * @type {Object}
       * @property {string} name - Name
       */
      name: String,
      // Future implementation: Item's category
      // category: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Category",
      // },
    })
  );

  return Item;
};