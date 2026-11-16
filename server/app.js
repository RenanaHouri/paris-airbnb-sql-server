const express = require("express");

const listingsRouter = require("./routes/listings.routes");
const hostsRouter = require("./routes/hosts.routes");

const app = express();
app.use(express.json());

app.use("/api/listings", listingsRouter);
app.use("/api/hosts", hostsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

module.exports = app;