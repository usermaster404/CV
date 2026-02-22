const User = require("../models/User");

exports.fetchUsers = async () => {
  const users = await User.find();
  return users;
};
