const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Obtener todos los libros del usuario
router.get('/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

// Obtener un libro por ID
router.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching book' });
    }
});


// Crear un nuevo libro
router.post('/books', async (req, res) => {
    const newBook = new Book(req.body);
    await newBook.save();
    res.json(newBook);
});

// Actualizar un libro
router.put('/books/:id', async (req, res) => {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
});

// Eliminar un libro
router.delete('/books/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting book' });
    }
});


module.exports = router;
