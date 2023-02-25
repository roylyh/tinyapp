const { PORT } = require("./constants");
const {
  generateRandomString,
  urlsForUser,
  getUserByEmail,
} = require("./helpers");
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const app = express();
app.set("view engine", "ejs");

const urlDatabase = {
  randomID1: {
    longURL: "http://www.google.com",
    userID: "userRandomID",
    totalClicks: 0,
    uniqueVisitors: [],
    visitHistory: [],
  },
  randomID2: {
    longURL: "http://www.reddit.com",
    userID: "userRandomID",
    totalClicks: 0,
    uniqueVisitors: [],
    visitHistory: [],
  },
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "1@1.com",
    password: "$2a$10$w.tavBkrvll35sEuXUw6DuAYT86Leh.1TxxJ2E4M7WKbKlochpUlO",
  },
  userRandomID2: {
    id: "userRandomID2",
    email: "2@2.com",
    password: "$2a$10$VKRlqwl7abYDPMseCTJSKuk1TTrjivti7glmF2vrQQDEpmJl/Sq4S",
  },
  userRandomID3: {
    id: "userRandomID3",
    email: "3@3.com",
    password: "$2a$10$FDtCIrWSS0XCbz9698L94u.Hfb2WekPBiZTeP/3VnBupFNlo5qcNq",
  },
};

// parse the body
app.use(express.urlencoded({ extended: true }));
// get the cookie info
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);
app.use(methodOverride("_method"));

// Routing

// redirect to /urls if logged in, other
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// redirect to urls page if logged in
app.get("/login", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_login", templateVars);
  }
});

// redirect to urls index page if credentials are valid
app.post("/login", (req, res) => {
  // set the cookie and redirect (redirect means sending back msg to browser)
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .send(
        "<html><body><b>please provide a username AND password.</b> <a href='/login'>Try it again</a></body></html>"
      );
  } else {
    const user = getUserByEmail(email, users);
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.userID = user.id;
        res.redirect("/urls");
      } else {
        res
          .status(400)
          .send(
            "<html><body><b>password do not match</b> <a href='/login'>Try it again</a></body></html>"
          );
      }
    } else {
      res
        .status(403)
        .send(
          `<html><body><b>no user with ${email} found</b>. Register first. <a href="/register">register now</a></body></html>`
        );
    }
  }
});

// logout clear cookies
app.post("/logout", (req, res) => {
  // clearCookie value equals undefined
  res.clearCookie("session").clearCookie("session.sig").redirect("/login");
});

// redirect to urls page if logged in
app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_registration", templateVars);
  }
});

// redirect to urls page if credential is valid
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .send(
        "<html><body><b>please provide a username AND password.</b> <a href='/register'>Try it again</a></body></html>"
      );
  } else if (getUserByEmail(email, users)) {
    res
      .status(400)
      .send(
        "<html><body><b>user with this email found.</b> Go to <a href='/login'>Login</a> Page</body></html>"
      );
  } else {
    // Use bcrypt When Storing Password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRandomID = generateRandomString();
    users[userRandomID] = { id: userRandomID, email, password: hashedPassword };
    req.session.userID = userRandomID;
    res.redirect("/urls");
  }
});

// show urls that belong to the user
app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    // the URLs where the userID is equal to the id of the currently logged-in user
    const urlDatabaseForUser = urlsForUser(user.id, urlDatabase);
    const templateVars = { urls: urlDatabaseForUser, user: user };
    res.render("urls_index", templateVars);
  } else {
    res
      .status(403)
      .send(
        "<html><body>Sorry. Please <b>Login</b> Go to <a href='/login'>Login</a> Page</body></html>"
      );
  }
});

// add new url to database
app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    const id = generateRandomString();
    // add totalClicks uniqueVisitors visitHistory for analytics
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: user.id,
      totalClicks: 0,
      uniqueVisitors: [],
      visitHistory: [],
    };
    res.redirect(`/urls/${id}`);
  } else {
    res
      .status(403)
      .send(
        "<html><body>Sorry. Please go to <a href='/login'>Login</a> Page.</body></html>"
      );
  }
});

// validate if the user logged in
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// shows the details if it belong to the user
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    if (urlDatabase[req.params.id].userID === user.id) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: user,
      };
      res.render("urls_show", templateVars);
    } else {
      res
        .status(403)
        .send(
          "<html><body>This individual URL pages should not be accesible if the URL does not belong to you. Check your URL list <a href='/urls'>here</a></body></html>"
        );
    }
  } else {
    res
      .status(403)
      .send(
        "<html><body>Sorry. Please go to <a href='/login'>Login</a> Page.</body></html>"
      );
  }
});

// delete the url if it belong to the user
app.delete("/urls/:id", (req, res) => {
  const user = users[req.session.userID];
  const shortUrl = req.params.id;
  // if the shorURL exit
  if (Object.keys(urlDatabase).includes(shortUrl)) {
    // if user logged in
    if (user) {
      // if user own the URL
      if (urlDatabase[shortUrl].userID === user.id) {
        delete urlDatabase[shortUrl];
        res.redirect("/urls");
      } else {
        res
          .status(403)
          .send(
            "<html><body>You doesn't own the URL. Check your URL list <a href='/urls'>here</a></body></html>"
          );
      }
    } else {
      res
        .status(403)
        .send(
          "<html><body>Sorry. Please go to <a href='/login'>Login</a> Page.</body></html>"
        );
    }
  } else {
    res
      .status(400)
      .send(
        "<html><body>The shortUrl doesn't not exist. Check your URL list <a href='/urls'>here</a></body></html>"
      );
  }
});

// update the LongURL info
app.put("/urls/:id", (req, res) => {
  const user = users[req.session.userID];
  // if user logged in
  if (user) {
    const shortUrl = req.params.id;
    const longURL = req.body.longURL;
    // if the shorUrl exist
    if (Object.keys(urlDatabase).includes(shortUrl)) {
      // if user own the URL
      if (urlDatabase[shortUrl].userID === user.id) {
        urlDatabase[shortUrl].longURL = longURL;
        res.redirect("/urls");
      } else {
        res
          .status(403)
          .send(
            "<html><body>You doesn't own the URL. Check your URL list <a href='/urls'>here</a></body></html>"
          );
      }
    } else {
      res
        .status(400)
        .send(
          "<html><body>The shortUrl doesn't not exist. Check your URL list <a href='/urls'>here</a></body></html>"
        );
    }
  } else {
    res
      .status(403)
      .send(
        "<html><body>Sorry. Please go to <a href='/login'>Login</a> Page.</body></html>"
      );
  }
});

// redirect to the actual url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    // get the userID
    const userID = req.session.userID;
    if (users[userID]) {
      if (!urlDatabase[req.params.id].uniqueVisitors.includes(userID)) {
        urlDatabase[req.params.id].uniqueVisitors.push(userID);
      }
      urlDatabase[req.params.id].visitHistory.push({timeStamp: new Date().toLocaleString(), vistorID: userID});
      urlDatabase[req.params.id].totalClicks++;
      console.log(urlDatabase);
      res.redirect(longURL);
    } else {
      res
        .status(403)
        .send(
          "<html><body>Sorry. Please go to <a href='/login'>Login</a> Page.</body></html>"
        );
    }
  } else {
    res
      .status(406)
      .send(
        `<html><body><b>${req.params.id}</b> could not found. Check your URL list <a href='/urls'>here</a></body></html>`
      );
  }
});

// server listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
