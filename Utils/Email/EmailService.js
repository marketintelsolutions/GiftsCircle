const sgMail = require('@sendgrid/mail')
const { formatAmount } = require("../HelperFunctions");
const { resolve } = require("path");
const pug = require("pug");
const moment = require('moment'); 

const SendVerifyEmail = async (recieverName, recieverEmail, otp) => {
  const templatePath = resolve(__dirname, "./templates/VerifyEmail.pug");

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    code: otp,
  });

  return await SendMail({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    html,
    subject: "Email Confirmation",
    customID: "Email Confirmation",
  });
};

const ResetPasswordEmail = async (recieverName, recieverEmail, link) => {
  const templatePath = resolve(
    __dirname,
    "./templates/ResetPassword.pug"
  );

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    link: link,
  });

  return await SendMail({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    html,
    subject: "Reset Password",
    customID: "Reset Password",
  });
};

const AdminSetPasswordEmail = async (
  recieverName,
  recieverEmail,
  defaultPassword,
  link
) => {
  const templatePath = resolve(
    __dirname,
    "./templates/AdminSetPassword.pug"
  );

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    defaultPassword: defaultPassword,
    link: link,
  });

  return await SendMail({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    html,
    subject: "Set Password",
    customID: "Set Password",
  });
};

const SendWebHookEmail = async (
  recieverName,
  recieverEmail,
  amount,
  deliveryAmount,
  products
) => {
  const templatePath = resolve(__dirname, "./templates/Payment.pug");
  products = products.map((ele) => {
    ele.amount = formatAmount(ele.amount);
    return ele;
  });

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    amount: formatAmount(amount),
    products: products,
    deliveryFee:
      deliveryAmount || deliveryAmount !== 0
        ? formatAmount(parseInt(deliveryAmount))
        : 0,
    recieverName: recieverName,
  });

  return await SendMail({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    html,
    subject: "Payment Successful",
    customID: "Payment Successful",
  });
};

const SendEventPublishedEmail = async (recieverName, recieverEmail, event) => {
  const templatePath = resolve(__dirname, "./templates/PublishEvent.pug");

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    recieverName: recieverName,
    title: event.title,
    ID: event.id,
    venue: event.venue,
    guestCode: event.guestCode,
    guestLink: `${process.env.FRONTEND_URL}/event/join/${event.id}`,
    date: moment(event.date).format("dddd, MMMM Do YYYY"),
    time: `${event.start_time} ${
      event.start_time.split(":")[0] > 12 ? "PM" : "AM"
    }`,
    endTime: `${event.end_time} ${
      event.end_time.split(":")[0] > 12 ? "PM" : "AM"
    }`,
    timeZone: "GMT + 1",
    link: `${process.env.FRONTEND_URL}/dashboard/event_details/${event.id}`,
  });

  return await SendMail({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    html,
    subject: "Event Published",
    customID: "Event Published",
  });
};

const SendContactAdminEmail = async (data) => {
  const templatePath = resolve(__dirname, "./templates/ContactAdmin.pug");

  const dateobj = new Date(data.created_at);
  const formattedTime = dateobj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  var options = { day: "numeric", month: "long", year: "numeric" };
  var formattedDate = dateobj.toLocaleDateString([], options);

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    date: formattedDate,
    time: formattedTime,
  });

  return await SendMail({
    recieverEmail: 'eventcircle01@gmail.com',
    recieverName: 'Admin',
    html,
    subject: "Contact Message",
    customID: "Contact Message",
  });
};

const SendMail = async ({
  recieverEmail,
  subject,
  html
}) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const msg = {
    to: recieverEmail, 
    from: 'eventcircle01@gmail.com', // Change to your verified sender
    subject: subject,
    html: html,
  }
  sgMail
  .send(msg)
  .then((response) => {
    console.log(response)
  })
  .catch((error) => {
    console.error(error)
  })
};

module.exports = {
  SendVerifyEmail,
  AdminSetPasswordEmail,
  SendWebHookEmail,
  ResetPasswordEmail,
  SendEventPublishedEmail,
  SendContactAdminEmail
};
