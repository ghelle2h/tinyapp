const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const {findUserByEmail, userBasedOnCookie, userIdFromEmail, urlsForUser, generateRandomString} = require('./helper');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
};


app.set("view engine", "ejs");

app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieSession({
  name: 'session',
  keys: ['DIFFERENT'],
  maxAge: 24 * 60 * 60 * 1000,
}));


app.get("/urls", (req, res) =>{
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (!userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]

  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userUrls:  urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  
  if (!urlDatabase[req.params.shortURL]) {
    const errorMessage = 'This short URL does not exist.';
    res.status(404).send(errorMessage);
    return;
  } else if (!req.session.user_id || !templateVars.userUrls[req.params.shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(404).send(errorMessage);
    return;
  }
  res.render("urls_shows", templateVars);
  
});

app.post("/urls/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) =>{
  if (userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {user: null};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) =>{
  const  newUser = req.body;
  const newId = generateRandomString();

  const userFound = findUserByEmail(newUser.email, users);
  

  if (userFound) {
    res.status(400).send('Email Taken');
    return;
  }

  if (newUser.email === "" || newUser.password === "") {
    res.status(400).send('Please input both email and password');
    return;
  }
  
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  
  req.session.user_id = newId;

  res.redirect("/urls");
});

app.get("/login", (req, res) =>{
  if (userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) =>{
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = findUserByEmail(userEmail, users);
  const userId = userIdFromEmail(userEmail, users);

  console.log(userFound.email);
  console.log(userEmail);
 

  if (userFound === false) {
    res.status(403).send('Email not found');
    return;
  }

  if (!bcrypt.compareSync(userPassword, userFound.password)) {
    res.status(403).send('Invalid Password');
    return;
  }
  
  req.session.user_id = userId;
  res.redirect('/urls');
    
  
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/logout", (req, res) =>{
  req.session = null;
  res.redirect("/urls");
});
