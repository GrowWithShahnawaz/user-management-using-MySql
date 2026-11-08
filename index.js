//mySQl password protection
require("dotenv").config();

const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

const express = require("express");
const app = express();
const port = 8080;

const path = require("path");

//uuid setUP
const { v4: uuidv4 } = require("uuid");

//static file setUp
app.use(express.static(path.join(__dirname, "public")));

//ejs SetUp.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

//method override setUp
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

//bulid connection with sql
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
//home rout (total users)
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some issues in DB");
  }
});

//show rout (show all users)
app.get("/user", (req, res) => {
  try {
    let q = `SELECT * FROM user`;
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showUsers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some issues in DB");
  }
});

//Edit rout
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  try {
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some issues in DB");
  }
});

//update rout (in DB)
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;

  try {
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // check password correction for update username
      if (formPass != user.password) {
        res.send("WRONG PASSWORD !");
      } else {
        let q2 = `UPDATE user SET username = '${newUsername}' WHERE id = '${id}'`;

        //Update in DB if Password is correct
        try {
          connection.query(q2, (err, result) => {
            if (err) throw err;
            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
          res.send("Some issues in DB");
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some issues in DB");
  }
});

//Admin rout
app.get("/admin", (req, res) => {
  try {
    let q = `SELECT * FROM user`;
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("admin.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some issues in DB");
  }
});

//show user rout

app.get("/admin/user/:id", (req, res) => {
  let { id } = req.params;

  let q = `SELECT * FROM user WHERE id = '${id}'`;

  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
      res.send("Some issues in DB");
    }

    let user = result[0];
    res.render("user.ejs", { user });
  });
});
// joining form rout
app.get("/user/join", (req, res) => {
  res.render("join.ejs");
});

//Add user rout
app.post("/user", (req, res) => {
  let { username, email, password } = req.body;
  let user = [uuidv4(), username, email, password];

  let q = `INSERT INTO user (id, username, email, password) VALUES(?, ?, ?, ?)`;
  connection.query(q, user, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Unable to create user.");
    }
    res.redirect("/");
  });
});

// delete route
app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass } = req.body;

  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q, (err, result) => {
    if (err) {
      console.log(err);
      res.send("Some issues in DB");
    }
    let user = result[0];
    if (formPass != user.password) {
      res.send("WRONG PASSWORD !");
    } else {
      let q2 = `DELETE FROM user WHERE id = '${id}'`;

      connection.query(q2, (err, result) => {
        if (err) {
          console.log(err);
          res.send("Some issues in DB");
        }
        res.redirect("/user");
      });
    }
  });
});

app.listen(port, (req, res) => {
  console.log("Server was Started on 8080");
});
