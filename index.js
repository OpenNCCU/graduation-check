const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "build")));

// app.use("/api/test", require("./test"));

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  const result = { data: [], success: false, error: "NULL PATH." };
  res.send(result);
});