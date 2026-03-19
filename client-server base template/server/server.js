const express = require("express");
require('dotenv').config();
const chaosRoutes = require("./routes/beemovieroute");
const userRoutes = require("./routes/userRoutes");
require("./config/db");

const app = express();

app.use(express.json());
app.use("/api/users", userRoutes);

app.use("/api/chaos", chaosRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});



const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
