const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
//functions from helpers
const {
  findUserByEmail,
  generateRandomString,
  urlsForUser,
  checkPassword,
} = require("./helpers");

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["random"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
//variables
const urlDatabase = {};
const users = {};

app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[req.session["user_id"]] };
  if (!req.session["user_id"]) {
    res.status = 401;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session["user_id"]) {
    res.redirect("/urls");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteShortURL = req.params.shortURL;
  const URLToBeDeleted = urlDatabase[deleteShortURL];
  if (URLToBeDeleted && URLToBeDeleted.userID === req.session.user_id) {
    delete urlDatabase[deleteShortURL];
    res.redirect("/urls");
  } else {
    const errorMessage = "You are not authorized to do that.";
    res.status(401).send(errorMessage);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortID] = {
    longURL: newLongURL,
    userID: req.session["user_id"],
  };
  res.redirect("/urls");
});

//logout page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Registration page
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: null,
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || bcrypt.compareSync(password, hashedPassword) === "") {
    res.status(400).send("You did not enter an email or password");
  }
  if (findUserByEmail(users, email)) {
    res.status(400).send("Sorry, user already exists!");
  }
  users[newID] = {
    id: newID,
    email: email,
    password: password,
  };
  req.session.user_id = newID;
  res.redirect("/urls");
});

//Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email);
  const hashPassword = bcrypt.hashSync(password, 10);
  if (user) {
    if (checkPassword(user, password || hashPassword)) {
      req.session.user_id = user.id;
    } else {
      res.status(403).send("Password Incorrect");
    }
  } else {
    res.status(403).send("User does not exist");
  }
  res.redirect("/urls");
});
