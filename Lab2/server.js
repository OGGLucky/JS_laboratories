const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const libraryData = require('./libraryData.json');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// Создание и подключение к SQLite базе данных
const db = new sqlite3.Database('library.db');

// Создание таблицы пользователей
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

// Создание таблицы взятых книг
db.run(`
  CREATE TABLE IF NOT EXISTS user_books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    checkoutDate TEXT NOT NULL,
    returnDate TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
  )
`);

// Регистрация нового пользователя
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Проверка, что пользователь с таким именем не существует
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';

  db.get(checkUserQuery, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ошибка при поиске пользователя в базе данных.' });
    }

    if (user) {
      return res.status(400).json({ success: false, message: 'Пользователь с таким именем уже существует.' });
    }

    // Создание нового пользователя
    const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';

    db.run(insertUserQuery, [username, password], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Ошибка при сохранении пользователя в базе данных.' });
      }

      res.json({ success: true, message: 'Регистрация успешна.' });
    });
  });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Поиск пользователя в списке
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.get(checkUserQuery, [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Ошибка при поиске пользователя в базе данных.' });
    }

    if (user) {
      res.json({ success: true, message: 'Авторизация успешна.' });
    } else {
      res.status(401).json({ success: false, message: 'Неверное имя пользователя или пароль.' });
    }
  });
});

// Поиск книг
app.get('/search', async (req, res) => {
  const { query, parameter } = req.query;

  let books;

  switch (parameter) {
    case 'isbn':
      books = libraryData.books.filter(book => book.isbn.includes(query));
      break;
    case 'authors':
      books = libraryData.books.filter(book => book.authors.some(author => author.includes(query)));
      break;
    case 'editionCode':
      books = libraryData.books.filter(book => book.editionCode.includes(query));
      break;
    case 'publisher':
      books = libraryData.books.filter(book => book.publisher.includes(query));
      break;
    case 'title':
    default:
      books = libraryData.books.filter(book => book.title.includes(query));
      break;
  }

  if (books.length === 0) {
    return res.status(404).json({ message: 'Книги не найдены.' });
  }

  res.json(books);
});

// Выдача книги
app.post('/checkout', (req, res) => {
  const { username, title } = req.body;

  // Фильтрация книг по title
  const book = libraryData.books.find((book) => book.title.includes(title));

  if (!book) {
    return res.status(404).json({ success: false, message: 'Книга не найдена в библиотеке.' });
  }
  book.availableCopies--;
  updateLibraryData();

  // Фиксация информации о взятии книги пользователем
  const checkoutDate = new Date().toLocaleString();
  const returnDate = new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toLocaleString();

  const insertUserBookQuery =
    'INSERT INTO user_books (username, title, checkoutDate, returnDate) VALUES (?, ?, ?, ?)';

  db.run(insertUserBookQuery, [username, book.title, checkoutDate, returnDate], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: 'Ошибка при сохранении информации о взятой книге в базе данных.' });
    }

    res.json({ success: true, message: 'Книга успешно взята.' });
  });
});

// Получение данных о пользователе и его взятых книгах
app.get('/user-data', (req, res) => {
  const { username } = req.query;

  const getUserBooksQuery = 'SELECT * FROM user_books WHERE username = ?';

  db.all(getUserBooksQuery, [username], (err, userBooks) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: 'Ошибка при получении данных о взятых книгах пользователя из базы данных.' });
    }

    if (userBooks.length === 0) {
      return res.status(404).json({ message: 'Данные о пользователе не найдены.' });
    }

    res.json(userBooks);
  });
});

// Возврат книги
app.post('/return', (req, res) => {
  const { username, title } = req.body;

  const returnBookQuery = 'DELETE FROM user_books WHERE username = ? AND title = ?';

  db.run(returnBookQuery, [username, title], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: 'Ошибка при возврате книги и удалении записи из базы данных.' });
    }
    const libraryBook = libraryData.books.find((book) => book.title === title);
    libraryBook.availableCopies++;
    updateLibraryData();

    res.json({ success: true, message: 'Книга успешно возвращена.' });
  });
});

// Функция для обновления данных в libraryData.json
function updateLibraryData() {
  const fs = require('fs');
  fs.writeFileSync('./libraryData.json', JSON.stringify(libraryData, null, 2));
}

// Подключение сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});