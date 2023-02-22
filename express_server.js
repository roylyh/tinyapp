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
  res.cookie("username", req.body.username).redirect("/urls");
});

app.post("/logout", (req, res) => {
  // clearCookie value equals undefined
  res.clearCookie("username").redirect("/urls");
});



app.get("/urls", (req, res) => {
  const templateVars = {urls:urlDatabase, username: req.cookies.username, };
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
  const templateVars = { username: req.cookies.username, };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username, };
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
