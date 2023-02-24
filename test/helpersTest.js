const assert = require("chai").assert;

const { getUserByEmail, urlsForUser } = require("../helpers");

// getUserByEmail Test
const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("#getUserByEmail", () => {
  it("should return a user with a valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.equal(user, testUsers.userRandomID);
  });

  it("should return undefined when looking for a non-existent email", () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.equal(user, undefined);
  });
});

// urlsForUser Test
const testUrls = {
  randomID1: {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
  randomID2: {
    longURL: "http://www.reddit.com",
    userID: "userRandomID",
  },
  randomID3: {
    longURL: "http://www.facebook.com",
    userID: "user2RandomID",
  },
};

describe("#urlsForUser", () => {
  it("should return the corresponding urls for a valid user", () => {
    const userUrls = urlsForUser("userRandomID", testUrls);
    const expectedUrls = {
      randomID1: {
        longURL: "http://www.google.com",
        userID: "userRandomID",
      },
      randomID2: {
        longURL: "http://www.reddit.com",
        userID: "userRandomID",
      },
    };

    assert.deepEqual(userUrls, expectedUrls);
  });

  it("should return an empty object for a non-existent user", () => {
    const userUrls = urlsForUser("randomID3", testUrls);
    assert.deepEqual(userUrls, {});
  });
});
