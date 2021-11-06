// Swagger API documentation configuration
const swaggerUi = require('swagger-ui-express'),
  customSwaggerTheme = "../documentation/swagger-ui/theme-monokai.css",
  YAML = require('yamljs'),
  swaggerDocument = YAML.load('./documentation/swagger-ui/definitions.yaml'),
  swaggerTheme = {
    customCssUrl: customSwaggerTheme
  };

require("dotenv").config();

const express = require("express"),
  cors = require("cors"),
  app = express(),
  corsOptions = {
    origin: "*"
  }

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Custom Swagger theme
app.get('/documentation/swagger-ui/theme-monokai.css', (req, res) => {
  res.sendFile('./documentation/swagger-ui/theme-monokai.css', { root: __dirname });
});

// Database config. User and Item models
const db = require("./app/models");

// Database connection
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// JSDoc API documentation routing
app.use('/docs/jsdoc', express.static(__dirname + '/documentation/jsdoc/generated'));

// Swagger API documentation routing
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerTheme));

// Item routes
require("./app/routes/items.routes")(app);

// User routes
require("./app/routes/users.routes")(app);

// Set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});