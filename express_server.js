const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/urls", (req, res) => {
  console.log(req.cookies) 
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user:users[req.cookies['user_id']]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };
  res.render("urls_show", templateVars);
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect(`/urls/${newShortUrl}`)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteShortURL = req.params.shortURL;
  delete urlDatabase[deleteShortURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortID] = newLongURL;
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  //const user_id = req.cookie.user_id;
  res.clearCookie("user_id");
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
    user: null
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;
  if(email === '' || password === ''){
    res.status(400).send("You did not enter an email or password");
    }
  if (findUserByEmail(users,email)) {
      res.status(400).send('Sorry, user already exists!');
      //return;
    }
  users[newID] = {
    "id": newID,
    "email": email,
    "password": password
  }

 res.cookie("user_id", newID);
  // res.cookie("email", email);
  res.redirect("/urls");
});

//Login page

app.get("/login", (req, res) => {
  const templateVars = {
    // shortURL: req.params.shortURL,
    // longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies['user_id']]
  };
  res.render("urls_login", templateVars);
});

const findUserByEmail = function(user, email) {
  for (const name in user){
    if(user[name].email === email){
        return user[name]
    }
  }
  return false;
}

const checkPassword = function(user, password){
  if(user.password === password){
    return true;
  } else {
    return false;
  }
}

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(users, email);
  if(user){
    if(checkPassword(user, password)){
      res.cookie("user_id", user.id);
    } else {
      res.status(403).send("Password Incorrect")
    }
  } else {
res.status(403).send("User does not exist")
  }
  res.redirect("/urls");
});