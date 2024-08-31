const express = require("express");
const axios = require("axios");
let libraryBooks = require("./booksdb.js");
let isAuthenticated = require("./auth_users.js").isAuthenticated;
let registeredUsers = require("./auth_users.js").registeredUsers;
const publicLibrary = express.Router();

const doesUserExist = (username) => {
  return registeredUsers.some((user) => user.username === username);
};

const fetchAllBooks = () => {
  return libraryBooks;
};

publicLibrary.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password is missing" });
  } else if (doesUserExist(username)) {
    return res.status(400).json({ message: "User already exists." });
  } else {
    registeredUsers.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User registered successfully. Please login." });
  }
});

// Get the list of books available in the library
publicLibrary.get("/", async (req, res) => {
  try {
    const booksList = await fetchAllBooks();
    return res.status(200).send(JSON.stringify(booksList, null, 4));
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get book details based on ISBN
publicLibrary.get("/isbn/:isbn", async (req, res) => {
  const isbnNumber = parseInt(req.params.isbn);
  const bookDetails = await libraryBooks[isbnNumber];
  if (!bookDetails) {
    return res.status(404).json({ message: "ISBN not found." });
  } else {
    return res.status(200).json(bookDetails);
  }
});

// Get book details based on author
publicLibrary.get("/author/:author", async (req, res) => {
  const authorBooks = Object.values(await libraryBooks).filter(
    (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
  );
  if (authorBooks.length > 0) {
    return res.status(200).send(JSON.stringify(authorBooks, null, 4));
  } else {
    return res.status(404).json({ message: "No books by that author." });
  }
});

// Get all books based on title
publicLibrary.get("/title/:title", async (req, res) => {
  const bookByTitle = Object.values(await libraryBooks).filter(
    (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
  )[0];
  if (bookByTitle) {
    return res.status(200).json(bookByTitle);
  } else {
    return res.status(404).json({ message: "Title not found." });
  }
});

// Get book reviews
publicLibrary.get("/review/:isbn", function (req, res) {
  const isbnNumber = req.params.isbn;
  const bookDetails = libraryBooks[isbnNumber];
  if (bookDetails) {
    return res.status(200).send(JSON.stringify(bookDetails.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

module.exports.general = publicLibrary;
