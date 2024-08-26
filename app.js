const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

const pool = new Pool({
  // add your configuration
});

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = rows[0];
  
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch(err) {
        return done(err);
      }
    })
  );
  


app.get("/sign-up", (req, res) => {
    console.log("Sign-up route accessed");
    res.render("sign-up-form");
  });
  

app.post("/sign-up", async (req, res, next) => {
    try {
      await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        req.body.username,
        req.body.password,
      ]);
      res.redirect("/");
    } catch(err) {
      return next(err);
    }
  });
app.get("/", (req, res) => res.render("index"));
  

app.listen(3000, () => console.log("app listening on port 3000!"));
