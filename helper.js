
const findUserByEmail = function(email, userDatabase) {
  for (let userId in userDatabase) {
    const user = userDatabase[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};

const userBasedOnCookie = function(cookie, userDB) {
  for (let user in userDB) {
    if (cookie === user) {
      return true;
    }
  }
  return false;
};

const userIdFromEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const urlsForUser = function(id, urlDatabase) {
  const userURLS = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLS[shortURL] = {
        longURL: urlDatabase[shortURL].longURL,
        userID: urlDatabase[shortURL].userID
      };
    }
  }
  return userURLS;
};
const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = {
  findUserByEmail,
  userBasedOnCookie,
  userIdFromEmail,
  urlsForUser,
  generateRandomString
};