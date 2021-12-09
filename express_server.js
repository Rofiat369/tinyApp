const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["random"],
  maxAge: 24 * 60 * 60 * 1000
}));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
},
i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
}
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur")
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk")
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


const urlsForUser = (id, database) => {
  let userUrls = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }

  return userUrls;
};

app.get("/urls", (req, res) => {
  const userID = req.session['user_id'];
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userUrls, user: users[req.session['user_id']]};
  if (!req.session['user_id']) {
    res.status = 401;
    //res.status(401).send('Login to view URLs!');
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session['user_id']) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.session['user_id']){
    res.redirect("/urls")
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session['user_id']]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); //debuggin purposes

app.post("/urls", (req, res) => {
  console.log(req.body); 
  const newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] ={
    longURL: req.body.longURL,
    userID: req.session['user_id']
  } 
  res.redirect(`/urls`)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL.longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteShortURL = req.params.shortURL;
  const URLToBeDeleted = urlDatabase[deleteShortURL];
  console.log(URLToBeDeleted)
  console.log(req.session.user_id)
  if(URLToBeDeleted && URLToBeDeleted.userID === req.session.user_id){
    delete urlDatabase[deleteShortURL];
    res.redirect('/urls');
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).send(errorMessage);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortID = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortID] ={
    longURL: newLongURL,
    userID: req.session['user_id']
  } 
  console.log(urlDatabase);
  res.redirect("/urls");
})

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
    user: null
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(email === '' || bcrypt.compareSync(password, hashedPassword) === ''){
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

 req.session.user_id = newID;
  // res.cookie("email", email);
  res.redirect("/urls");
});


//Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session['user_id']]
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
  const hashPassword = bcrypt.hashSync(password, 10)
  if(user){
    if(checkPassword(user, password||hashPassword)){
      req.session.user_id = user.id;
    } else {
      res.status(403).send("Password Incorrect")
    }
  } else {
res.status(403).send("User does not exist")
  }
  res.redirect("/urls");
});