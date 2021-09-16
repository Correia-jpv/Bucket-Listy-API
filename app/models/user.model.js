module.exports = mongoose => {
  const User = mongoose.model(
    "user",
    mongoose.Schema({
      name: String,
      idToken: String,
      items: [{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "Item",
        item: String,
        checked: Boolean
      }]
    })
  );

  return User;
};