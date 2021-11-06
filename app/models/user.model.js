module.exports = mongoose => {
  const User = mongoose.model(
    "user",
    mongoose.Schema({
      /**
       * @class 
       * @alias User
       * @type {Object}
       * @property {string} [name] - Name
       * @property {string} idToken - Login token
       * @property {Array<Item>} items - {@link Item} collection
       */
      name: String,
      idToken: String,
      items: [{
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          unique: true,
          sparse: true
        },
        checked: { type: Boolean, default: false }
      }],
    })
  );
  return User;
};