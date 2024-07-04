const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
    completion_date: String,
    stars: Number,
    userIdentifier: { type: String, required: true } // Identificador del usuario
});

module.exports = mongoose.model('Book', bookSchema);
