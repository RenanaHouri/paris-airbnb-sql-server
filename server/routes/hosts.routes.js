const express = require("express");
const router = express.Router();

const { getHostListings } = require("../controllers/hosts.controller");

router.get("/:hostId/listings", getHostListings);

module.exports = router;