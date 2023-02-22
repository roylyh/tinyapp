const { PORT } = require("./constants");
const { generateRandomString } = require("./util");
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
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

// parse the body
app.use(express.urlencoded({ extended: true }));
// get the cookie info
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello! Welcome to URL shorting application.");
});

app.get("/urls.json", (req, res) => {
  // automatically transfer object to JSON
  res.json(urlDatabase);
}
);

app.post("/login", (req, res) => {
  // set the cookie and redirect (redirect means sending back msg to browser)
  res.cookie("user_id", req.body.user_id).redirect("/urls");
});

app.post("/logout", (req, res) => {
  // clearCookie value equals undefined
  res.clearCookie("user_id").redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const userRandomID = generateRandomString();
  users[userRandomID] = {id: userRandomID, email, password};
  res.cookie("user_id", userRandomID).redirect("/urls");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {urls:urlDatabase, user: user, };
  res.render("urls_index", templateVars);
}
);

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
}
);

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user, };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: user, };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
}
);

// update the LongURL info
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
}
);

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
}
);

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}
);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
