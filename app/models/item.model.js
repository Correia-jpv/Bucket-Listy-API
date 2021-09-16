module.exports = mongoose => {
  const Item = mongoose.model(
    "item",
    mongoose.Schema({
      name: String,
      checked: Boolean,
    })
  );

  return Item;
};