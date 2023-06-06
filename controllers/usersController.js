const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Note = require('../models/Note');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  if (!users?.length) {
    return res.status(400).json({ message: 'No users found.' });
  }

  return res.status(200).json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  console.log(username, password, roles, '===========');

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json(`Username ${username} already exists.`);
  }
  const hashedPwd = await bcrypt.hash(password, 10);

  const newUserObj = { username, password: hashedPwd, roles };

  const user = await User.create(newUserObj);

  if (!user) {
    return res.status(400).json({ message: 'Invalid user data received.' });
  }

  return res.status(201).json({ message: `User ${username} successfully created.` });
});

const updateUser = asyncHandler(async (req, res) => {
  const {
    id, username, roles, active, password,
  } = req.body;

  console.log(id, username, roles, active, password, '=======');

  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({ message: 'All fields except password are required.' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found.' });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate usernames are not allowed.' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  return res.json(`${updatedUser.username} successfully updated.`);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: 'User ID required.' });
  }

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: 'User has assigned notes.' });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.json(400).json({ message: `User with ID: "${id}" is not found.` });
  }

  const result = await user.deleteOne();

  return res.status(201).json({ message: `Username "${result.username}" with ID: "${result.id}" is successfully deleted.` });
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
