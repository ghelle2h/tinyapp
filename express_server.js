const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { findUserByEmail, userBasedOnCookie, userIdFromEmail, urlsForUser, generateRandomString } = require('./helper');

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



app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieSession({
  name: 'session',
  keys: ['DIFFERENT'],
  maxAge: 24 * 60 * 60 * 1000,
}));
//Redirects to login page if there is no user or /urls page if there is a user
app.get("/", (req, res) => {
  if (userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//gets urls that belong to user
app.get("/urls", (req, res) =>{
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  if(templateVars.user) {
    res.render("urls_index", templateVars);
  } else {
    res.status(404).send("Please login to view URLS page");
  }
  
  
});
//redirects to short url page
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  
  res.redirect(`/urls/${shortURL}`);
});
// loads new urls page
app.get("/urls/new", (req, res) => {
  if (!userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/login");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id]

  };
  res.render("urls_new", templateVars);
});

// gets url information for id short url
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userUrls:  urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  // error handling for invalid user input 
  if (!req.session.user_id || !templateVars.userUrls[req.params.shortURL]) {
    const errorMessage = 'You are not authorized to see this URL.';
    res.status(404).send(errorMessage);
    return; 
  }
  res.render("urls_shows", templateVars);
  }  
    const errorMessage = 'This short URL does not exist.';
    res.status(404).send(errorMessage);
    return;
   
  })
  
  

// posts users url input and redirects to urls
app.post("/urls/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;

  res.redirect(`/urls`);

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
// connects to database 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// redirects to  actual longUrl page 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// gets the register page and loads it
app.get("/register", (req, res) =>{
  // if user is already logged in redirect to urls page
  if (userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {user: null};
  res.render("urls_register", templateVars);
});
// posts new user info to database
app.post("/register", (req, res) =>{
  const  newUser = req.body;
  const newId = generateRandomString();

  const userFound = findUserByEmail(newUser.email, users);
  
// Error handling for invalid inputs
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
//loads login page
app.get("/login", (req, res) =>{
  // if user is logged in redirect to urls page
  if (userBasedOnCookie(req.session.user_id, users)) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {
    user: users[req.session.user_id],
  };

  res.render('urls_login', templateVars);
});
// posts user information and redirects to urls page
app.post("/login", (req, res) =>{
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userFound = findUserByEmail(userEmail, users);
  const userId = userIdFromEmail(userEmail, users);

  console.log(userFound.email);
  console.log(userEmail);
 
// error handling for invalid inputs 
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

// delets shortURL for user
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
// logs user out
app.post("/logout", (req, res) =>{
  req.session = null;
  res.redirect("/urls");
});
