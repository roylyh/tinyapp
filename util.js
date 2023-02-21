const generateRandomString = function(length = 6) {
  return Math.random().toString(20).substring(2,length + 2);
};

module.exports = { generateRandomString };