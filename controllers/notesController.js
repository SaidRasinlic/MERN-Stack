const Note = require('../models/Note');
const User = require('../models/User');

const getAllNotes = async (req, res) => {
  const notes = await Note.find().lean().exec();

  if (!notes?.length) {
    return res.status(200).json({ message: 'No notes found. Oh shit!' });
  }

  const notesWithUser = await Promise.all(notes.map(async (note) => {
    const user = await User.findById(note.user).lean().exec();
    return { ...note, username: user.username };
  }));

  return res.status(200).json(notesWithUser);
};

const createNewNote = async (req, res) => {
  const { user, title, text } = req.body;

  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All data fields are required.' });
  }

  // Check for duplicate title
  const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();

  if (duplicate) {
    res.status(409).json({ message: 'Duplicate notes are not allowed.' });
  }

  const newNote = await Note.create({ user, title, text });

  if (!newNote) {
    res.status(400).json({ message: 'Invalid note data received.' });
  }

  return res.status(201).json({ message: 'Note successfully created.' });
};

const updateNote = async (req, res) => {
  const {
    id, user, title, text, completed,
  } = req.body;

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All data fields are required.' });
  }

  // Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found.' });
  }
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate titles are not allowed.' });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  return res.status(201).json(updatedNote);
};

const deleteNote = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: 'Note ID required.' });
  }

  const note = await Note.findById(id).lean().exec();

  const result = note.deleteOne();

  return res.status(201).json({ message: `Note "${result.title}" with the ID "${result.id}" is successfully deleted` });
};

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
