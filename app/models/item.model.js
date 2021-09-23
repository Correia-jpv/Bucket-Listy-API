module.exports = mongoose => {
  const Item = mongoose.model(
    "item",
    mongoose.Schema({
      name: String,
      // category: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Category",
      // },
    })
  );

  return Item;
};