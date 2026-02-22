const express = require("express");
const router = express.Router();
const { getBeeChaos } = require("../controllers/beemoviecontroller");

router.get("/bee", getBeeChaos);

module.exports = router;
