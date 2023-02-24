const generateRandomString = function(length = 6) {
  return Math.random()
    .toString(20)
    .substring(2, length + 2);
};

const urlsForUser = function(id, urlDatabase) {
  const keys = Object.keys(urlDatabase).filter(
    (key) => urlDatabase[key].userID === id
  );
  let result = {};
  for (let key of keys) {
    result[key] = urlDatabase[key];
  }
  return result;
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail, };
