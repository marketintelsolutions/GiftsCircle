const { VerifyToken } = require("./HelperFunctions");

const EnsureAuthenticated = (req, res, next) => {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    try {
      VerifyToken(token);
      next();
    } catch (err) {
      console.log(err);
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
};

const UserAuthenticated = (req, res, next) => {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    try {
      let payload = VerifyToken(token);
      if (payload.role === "USER") {
        next();
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
};

const AdminAuthenticated = (req, res, next) => {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    try {
      let payload = VerifyToken(token);
      if (payload.role === "ADMIN" || payload.role === "SUPERADMIN") {
        next();
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
};

const SuperAdminAuthenticated = (req, res, next) => {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    try {
      let payload = VerifyToken(token);
      if (payload.role === "SUPERADMIN") {
        next();
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
};
module.exports = {
  EnsureAuthenticated,
  UserAuthenticated,
  AdminAuthenticated,
  SuperAdminAuthenticated,
};
