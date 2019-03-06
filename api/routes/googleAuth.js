const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = app => {
  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get(
    "/auth/google/start",
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );

  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};
