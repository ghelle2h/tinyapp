const findUserByEmail = function (email, userDatabase) {
  for (let userId in userDatabase) {
    const user = userDatabase[userId];
    if (email === user.email) {
      return user;
    }
  }

  return false;
};

const userBasedOnCookie = function(cookie, userDB) {
  for(let user in userDB) {
    if(cookie === user){
      return true;
    }
  }
  return false;
}

const userIdFromEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const urlsForUser = function (id, urlDatabase) {
  const userURLS = {}
  for(const shortUrl in urlDatabase) {
    if(urlDatabase[shortUrl].userID === id) {
      userURLS[shortUrl] = urlDatabase[shortUrl]
    }
  }
  return userURLS;
}
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

module.exports = {
  findUserByEmail,
  userBasedOnCookie,
  userIdFromEmail,
  urlsForUser,
  generateRandomString
}