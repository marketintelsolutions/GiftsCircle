const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const moment = require("moment");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// point to the template folder
const handlebarOptions = {
  viewEngine: {
    partialsDir: path.resolve("./Utils/Email/views/"),
    defaultLayout: false,
  },
  viewPath: path.resolve("./Utils/Email/views/"),
};

// use a template file with nodemailer
transporter.use("compile", hbs(handlebarOptions));

const SendEventPublishEmail = (reciever, name, event) => {
  var mailOptions = {
    from: '"Godwill" <godwillonyewuchii@gmail.com>', // sender address
    to: reciever, // list of receivers
    subject: "Event Published",
    template: "publish", // the name of the template file i.e email.handlebars
    context: {
      username: name,
      eventName: event.title,
      id: event.id,
      eventVenue: event.venue,
      guestCode: event.guestCode,
      guestLink: `https://giftscircle.netlify.app/event/join/${event.id}`,
      eventDate: moment(event.date).format("dddd, MMMM Do YYYY"),
      eventTime: `${event.start_time} ${
        event.start_time.split(":")[0] > 12 ? "PM" : "AM"
      }`,
      endTime: `${event.end_time} ${
        event.end_time.split(":")[0] > 12 ? "PM" : "AM"
      }`,
      timezone: "GMT + 1",
      url: `https://giftscircle.netlify.app/dashboard/event_details/${event.id}`,
    },
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: " + info.response);
  });
};

const AdminSetPasswordEmail = (adminName, defaultPassword, email, token) => {
  var mailOptions = {
    from: '"Godwill" <godwillonyewuchii@gmail.com>',
    to: email, 
    subject: "Set Password",
    template: "adminCreate", 
    context: {
      username: adminName,
      defaultPassword: defaultPassword,
      email: email,
      url: `https://eventcircleadmin.netlify.app/admin/setPassword?token=${token}`,
    },
  };

  // trigger the sending of the E-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: " + info.response);
  });
};

module.exports = { SendEventPublishEmail, AdminSetPasswordEmail };
