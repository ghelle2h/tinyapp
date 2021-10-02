const { assert } = require('chai');
const { userBasedOnCookie, findUserByEmail, urlsForUser, userIdFromEmail } = require('../helper.js');

const testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const testUsers = {
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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return false when email is not registered', function() {
    const user = findUserByEmail('kobe@mamba.com', testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});

describe('userBasedOnCookie', function() {
  it('should return a user with cookie', function() {
    const cookie = userBasedOnCookie('userRandomID', testUsers);
    const expectedCookie = true;
    assert.equal(cookie, expectedCookie);
  });
});


describe('urlsForUser', function() {

  it('should return an object of url information specific to the given user ID', function() {
    const userUrls = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedOutput = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
      }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });
  it('should return empty object', function() {
    const useUrls = urlsForUser("24kobe", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(useUrls, expectedOutput);
  });
});

describe('userIdFromEmail', function() {
  it('should return user ID of email address', function() {
    const userId = userIdFromEmail('user@example.com', testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(userId, expectedOutput);
  });
});
