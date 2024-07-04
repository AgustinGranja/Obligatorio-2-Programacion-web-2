const express = require('express');
const connectDB = require('./config');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();
connectDB(); // Conectar a la base de datos

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Sirve archivos estáticos desde el frontend

app.use('/api', bookRoutes);
app.use('/api', userRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

