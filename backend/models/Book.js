const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    completion_date: String,
    stars: Number,
});

module.exports = mongoose.model('Book', bookSchema);
