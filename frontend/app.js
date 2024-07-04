let searchTimeout;
let imageIndex = 0; // Índice de la imagen actual

function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadBooks, 300); // Retraso de 300ms antes de realizar la búsqueda
}

async function searchImage(bookTitle, index = 0) {
    const query = bookTitle + ' libro';
    const apiKey = 'AIzaSyCCkHJJl70fwn3rzsQn6scanHuQDbz0sYE';
    const cx = '340105728facf4f60';
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&cx=${cx}&key=${apiKey}&searchType=image&num=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0 && data.items[index]) {
            return data.items[index].link; // Devuelve la URL de la imagen en el índice especificado
        } else {
            return null; // No se encontró ninguna imagen
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        return null; // En caso de error, devuelve null
    }
}

async function changeImage(bookTitle, imgElement) {
    imageIndex = (imageIndex + 1) % 10; // Cambiar el índice de la imagen
    const newImageUrl = await searchImage(bookTitle, imageIndex);
    if (newImageUrl) {
        imgElement.src = newImageUrl;
    }
}

let currentPage = 1;
const booksPerPage = 5; // Número de libros por página

async function fetchBookDetails(bookTitle) {
    const query = bookTitle + ' libro';
    const apiKey = 'AIzaSyCCkHJJl70fwn3rzsQn6scanHuQDbz0sYE';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items[0].volumeInfo; // Devuelve la información del primer libro encontrado
        } else {
            return null; // No se encontró ninguna información
        }
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null; // En caso de error, devuelve null
    }
}

async function loadBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        const genreFilter = document.getElementById('genreFilter').value;
        const searchBar = document.getElementById('searchBar').value.toLowerCase();
        const booksList = document.getElementById('books-list');
        booksList.innerHTML = ''; // Limpiar la lista antes de cargar nuevos libros

        const filteredBooks = books.filter(book => 
            (genreFilter === 'all' || book.genre === genreFilter) &&
            (!searchBar || book.title.toLowerCase().includes(searchBar))
        );

        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const paginatedBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

        for (const book of paginatedBooks) {
            const li = document.createElement('li');

            // Añadir imagen del libro
            const img = document.createElement('img');
            const imageUrl = await searchImage(book.title); // Mueve esta línea dentro de un bloque async
            if (imageUrl) {
                img.src = imageUrl;
            } else {
                img.src = 'path/to/your/default/image.png'; // Imagen por defecto si no se encuentra ninguna
            }
            li.appendChild(img);

            // Añadir detalles del libro
            const detailsDiv = document.createElement('div');
            const title = document.createElement('p');
            title.textContent = `Título: ${book.title}`;
            detailsDiv.appendChild(title);

            const author = document.createElement('p');
            author.textContent = `Autor: ${book.author}`;
            detailsDiv.appendChild(author);

            const genre = document.createElement('p');
            genre.textContent = `Género: ${book.genre}`;
            detailsDiv.appendChild(genre);

            const completionDate = document.createElement('p');
            const compDate = book.completion_date ? book.completion_date.split('T')[0] : 'N/A';
            completionDate.textContent = `Fecha de Finalización: ${compDate}`;
            detailsDiv.appendChild(completionDate);

            const stars = document.createElement('p');
            stars.textContent = `Calificación: ${'★'.repeat(book.stars)}`;
            detailsDiv.appendChild(stars);

            // Botón de editar
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => {
                window.location.href = `book_form.html?id=${book._id}`;
            };
            detailsDiv.appendChild(editButton);

            // Botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.style.backgroundColor = '#dc3545';
            deleteButton.style.marginLeft = '10px';
            deleteButton.onclick = async () => {
                if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
                    await deleteBook(book._id);
                    loadBooks();
                }
            };
            detailsDiv.appendChild(deleteButton);

            // Botón de cambiar imagen
            const changeImageButton = document.createElement('button');
            changeImageButton.textContent = 'Cambiar Imagen';
            changeImageButton.style.backgroundColor = '#007BFF';
            changeImageButton.style.marginLeft = '10px';
            changeImageButton.onclick = () => {
                changeImage(book.title, img);
            };
            detailsDiv.appendChild(changeImageButton);

            // Hacer clic en el libro para ver detalles
            img.onclick = async () => {
                const bookDetails = await fetchBookDetails(book.title);
                if (bookDetails) {
                    sessionStorage.setItem('bookDetails', JSON.stringify(bookDetails));
                    window.location.href = 'book_detail.html';
                } else {
                    alert('No se encontraron detalles adicionales para este libro.');
                }
            };

            li.appendChild(detailsDiv);
            booksList.appendChild(li);
        }

        renderPagination(totalPages);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('page-button');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = () => {
            currentPage = i;
            loadBooks();
        };
        paginationContainer.appendChild(pageButton);
    }
}



async function deleteBook(bookId) {
    fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        console.log('Book deleted:', data);
    })
    .catch(error => console.error('Error deleting book:', error));
}

function loadBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        fetch(`/api/books/${bookId}`)
            .then(response => response.json())
            .then(book => {
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('genre').value = book.genre;
            document.getElementById('completion_date').value = book.completion_date.split('T')[0];
            document.getElementById('stars').value = book.stars;
        })
        .catch(error => console.error('Error loading book details:', error));
    }
}

function displayBookDetails() {
    const bookDetails = JSON.parse(sessionStorage.getItem('bookDetails'));
    if (bookDetails) {
        document.getElementById('book-title').textContent = bookDetails.title || 'N/A';
        document.getElementById('book-author').textContent = bookDetails.authors ? bookDetails.authors.join(', ') : 'N/A';
        document.getElementById('book-genre').textContent = bookDetails.categories ? bookDetails.categories.join(', ') : 'N/A';
        document.getElementById('book-publication-date').textContent = bookDetails.publishedDate || 'N/A';
        document.getElementById('book-description').textContent = bookDetails.description || 'N/A';
        document.getElementById('book-publisher').textContent = bookDetails.publisher || 'N/A';
        document.getElementById('book-page-count').textContent = bookDetails.pageCount || 'N/A';
        document.getElementById('book-isbn').textContent = bookDetails.industryIdentifiers ? bookDetails.industryIdentifiers.map(id => id.identifier).join(', ') : 'N/A';
    } else {
        alert('No se encontraron detalles adicionales para este libro.');
    }
}


function addOrEditBook(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    const method = bookId ? 'PUT' : 'POST';
    const endpoint = bookId ? `/api/books/${bookId}` : '/api/books';

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        genre: document.getElementById('genre').value,
        completion_date: document.getElementById('completion_date').value,
        stars: document.getElementById('stars').value,
    };

    fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/main.html';
        })
        .catch(error => console.error('Error:', error));
}

function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/index.html';
        })
        .catch(error => console.error('Error:', error));
}

function loginUser(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            window.location.href = '/main.html';
        })
        .catch(error => console.error('Error:', error));
}

function logoutUser() {
    fetch('/api/logout')
        .then(response => response.json())
        .then(data => {
            console.log('Logged out:', data);
            window.location.href = '/index.html';
        })
        .catch(error => console.error('Error:', error));
}
