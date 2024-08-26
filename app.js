const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

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
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
        // passwords do not match!
         return done(null, false, { message: "Incorrect password" })
        }

        return done(null, user);
      } catch(err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      const user = rows[0];
  
      done(null, user);
    } catch(err) {
      done(err);
    }
  });
    


app.get("/sign-up", (req, res) => {
    console.log("Sign-up route accessed");
    res.render("sign-up-form");
  });
  

  app.post("/sign-up", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err); // Handle the error
      }
  
      try {
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
          req.body.username,
          hashedPassword,
        ]);
        res.redirect("/");
      } catch(err) {
        return next(err); // Handle database errors
      }
    });
  });   

  app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );  
  app.get("/", (req, res) => {
    res.render("index", { user: req.user });
  });
  app.get("/log-out", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  

app.listen(3000, () => console.log("app listening on port 3000!"));
