const { PORT } = require("./constants");
const { generateRandomString, urlsForUser, getUserByEmail, } = require("./helpers");
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const morgan = require("morgan");
const app = express();
// res.status(400);
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "3@3.com",
    password: "$2a$10$IEVRUSW.pUoDeBY3F.5XyO7PEFRhB6s.Cs1nWxcIgDzo5us.q5w9S",
  },
};

// parse the body
app.use(express.urlencoded({ extended: true }));
// get the cookie info
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
// use morgan
app.use(morgan('dev'));

app.get("/", (req, res) => {
  res.send("Hello! Welcome to URL shorting application.");
});

app.get("/urls.json", (req, res) => {
  // automatically transfer object to JSON
  res.json(urlDatabase);
});

app.get("/login",(req, res) => {
  const user = users[req.session.userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_login", templateVars);
  }
}
);

// Loggin in
// redirect to urls index page if credentials are valid
app.post("/login", (req, res) => {
  // set the cookie and redirect (redirect means sending back msg to browser)
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("<html><body><b>E-mail and password are both needed.</b></body></html>");
  } else {
    const user = getUserByEmail(email, users);
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.userID = user.id;
        res.redirect("/urls");
      } else {
        res.status(400).send("<html><body><b>Invalid password</b></body></html>");
      }
    } else {
      res.status(403).send(`<html><body><b>The email could not be found.${email}</b></body></html>`);
    }
  }
});

app.post("/logout", (req, res) => {
  // clearCookie value equals undefined
  res.clearCookie("session").clearCookie("session.sig").redirect("/login");
});

app.get("/register", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: user };
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("<html><body><b>E-mail and password are both needed.</b></body></html>");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("<html><body><b>E-mail has existed.</b></body></html>");
  } else {
    // Use bcrypt When Storing Password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRandomID = generateRandomString();
    users[userRandomID] = { id: userRandomID, email, hashedPassword };
    console.log(users);
    req.session.userID = userRandomID;
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    // the URLs where the userID is equal to the id of the currently logged-in user
    const urlDatabaseForUser = urlsForUser(user.id, urlDatabase);
    const templateVars = { urls: urlDatabaseForUser, user: user };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("<html><body>Sorry. Please <b>Login</b></body></html>");
  }
});

app.post("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    const id = generateRandomString();
    urlDatabase[id] = {longURL: req.body.longURL, userID: user.id,};
    res.redirect(`/urls/${id}`);
  } else {
    res.status(403).send("<html><body>Sorry. Please <b>Login</b></body></html>");
  }
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  if (user) {
    const templateVars = { user: user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
  


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
      res.status(403).send("<html><body>This individual URL pages should not be accesible if the URL does not belong to you.</body></html>");
    }
  } else {
    res.status(403).send("<html><body>Sorry. Please <b>Login</b></body></html>");
  }
});

app.post("/urls/:id/delete", (req, res) => {
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
        res.status(403).send("<html><body>You doesn't own the URL.</body></html>");
      }
    } else {
      res.status(403).send("<html><body>Sorry. Please <b>Login</b></body></html>");
    }
  } else {
    res.status(400).send("<html><body>The shortUrl doesn't not exist.</body></html>");
  }
  
});

// update the LongURL info
app.post("/urls/:id", (req, res) => {
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
        res.status(403).send("<html><body>You doesn't own the URL.</body></html>");
      }
    } else {
      res.status(400).send("<html><body>The shortUrl doesn't not exist.</body></html>");
    }
  } else {
    res.status(403).send("<html><body>Sorry. Please <b>Login</b></body></html>");
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(406).send(`<html><body><b>${req.params.id}</b> could not found</body></html>`);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
