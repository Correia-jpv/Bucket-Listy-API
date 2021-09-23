module.exports = mongoose => {
  const User = mongoose.model(
    "user",
    mongoose.Schema({
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