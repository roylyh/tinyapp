// generate a random string, length = 6 default
const generateRandomString = function(length = 6) {
  return Math.random()
    .toString(20)
    .substring(2, length + 2);
};

// get a obj whose userID equals id from urlDatabase
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

// find the user in the database with email, if not found return undefined
const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail, };
