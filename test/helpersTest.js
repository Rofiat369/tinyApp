const { assert } = require('chai');

const {findUserByEmail} = require('../helpers.js');
const {urlsForUser} = require('../helpers.js');

const testUsers = {
  "abc": {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail(testUsers, "user@example.com")
    assert.equal(testUsers.abc, user);
  });

  it('should return undefined when looking for a non-existent email', () => {
    const user = findUserByEmail(testUsers, "ghostperson@example.com");
    assert.equal(user, undefined);
  });
});

const testUrls = {
  'abcd': {
    longURL: 'http://www.google.com',
    userID: 'james'
  },
  'xywz': {
    longURL: 'http://www.reddit.com',
    userID: 'Nunu'
  },
  'jfkd': {
    longURL: 'http://www.facebook.com',
    userID: 'bibi'
  }
};

describe('urlsForUser', () => {
  it('should return the corresponding urls for a valid user', () => {
    const URLS = urlsForUser('james', testUrls);
    const expectedResult = {
      'abcd': {
        longURL: 'http://www.google.com',
        userID: 'james'
      },
    };

    assert.deepEqual(URLS, expectedResult);
  });

  it('should return an empty object for a non-existent user', () => {
    const URLS = urlsForUser('crystal', testUrls);
    assert.deepEqual(URLS, {});
  });
});