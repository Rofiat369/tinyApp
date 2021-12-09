const findUserByEmail = function(user, email) {
  for (const name in user){
    if(user[name].email === email){
        return user[name]
    }
  }
}

const checkPassword = function(user, password){
  return user.password === password;
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

module.exports = {findUserByEmail, generateRandomString, urlsForUser, checkPassword};