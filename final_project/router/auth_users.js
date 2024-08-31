const express = require("express");
const jwt = require("jsonwebtoken");
let bookCollection = require("./booksdb.js");
const registeredUsers = express.Router();

let userList = [];

// Returns boolean indicating if the username exists
const doesUserExist = (username) => {
  return userList.some((user) => user.username === username);
};

// Returns boolean indicating if the username and password match
const isAuthenticatedUser = (username, password) => {
  return userList.some(
    (user) => user.username === username && user.password === password
  );
};

// User login
registeredUsers.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username or password is missing" });
  } else if (!isAuthenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect username or password" });
  } else {
    const accessToken = jwt.sign({ data: password }, "accessSecret", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User logged in successfully." });
  }
});

// Add or update a book review
registeredUsers.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const userReview = req.body.review;
  const isbnCode = req.params.isbn;

  if (!userReview) {
    res.status(400).json({ message: "Review cannot be empty!" });
  } else {
    bookCollection[isbnCode].reviews[username] = userReview;
    res.status(200).json({ message: "Book review updated successfully." });
  }
});

// Delete a book review
registeredUsers.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbnCode = req.params.isbn;

  if (!bookCollection[isbnCode]) {
    res.status(400).json({ message: "Invalid ISBN." });
  } else if (!bookCollection[isbnCode].reviews[username]) {
    res
      .status(400)
      .json({ message: `${username} has not submitted a review for this book.` });
  } else {
    delete bookCollection[isbnCode].reviews[username];
    res.status(200).json({ message: "Book review deleted successfully." });
  }
});

module.exports.authenticated = registeredUsers;
module.exports.doesUserExist = doesUserExist;
module.exports.userList = userList;

