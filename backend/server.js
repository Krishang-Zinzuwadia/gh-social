require("dotenv").config();

// Load the Express app and start the backend server.
const app = require("./app");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
