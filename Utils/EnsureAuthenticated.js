const { VerifyToken } = require("./HelperFunctions");

const EnsureAuthenticated = (req, res, next) => {
  const header = req.headers["authorization"];

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    try {
      let payload = VerifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      console.log(err);
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
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
        req.user = payload;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
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
        req.user = payload;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
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
        req.user = payload;
        next();
      } else {
        res.sendStatus(401);
      }
    } catch (err) {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
};
module.exports = {
  EnsureAuthenticated,
  UserAuthenticated,
  AdminAuthenticated,
  SuperAdminAuthenticated,
};
