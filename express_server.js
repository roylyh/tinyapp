const { PORT } = require("./constants");
const { generateRandomString } = require("./util");
const express = require("express");
const app = express();

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// parse the dody
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}
);

app.get("/urls", (req, res) => {
  const templateVars = {urls:urlDatabase};
  res.render("urls_index", templateVars);
}
);

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK");
}
);

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[this.id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}
);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
