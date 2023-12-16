const MailJet = require("node-mailjet");
const { formatAmount } = require("../HelperFunctions");
const { resolve } = require("path");
const pug = require("pug");

const SendVerifyEmail = async (recieverName, recieverEmail, otp) => {
  const templatePath = resolve(__dirname, "./templates/VerifyEmail.pug");

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    recieverEmail: recieverEmail,
    recieverName: recieverName,
    code: otp,
  });

  return await SendEmailMJ({
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

  return await SendEmailMJ({
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

  return await SendEmailMJ({
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

  return await SendEmailMJ({
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

  return await SendEmailMJ({
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
    recieverName: recieverName,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    date: formattedDate,
    time: formattedTime,
  });

  return await SendEmailMJ({
    recieverEmail: 'eventcircle01@gmail.com',
    recieverName: 'Admin',
    html,
    subject: "Contact Message",
    customID: "Contact Message",
  });
};

const SendEmailMJ = async ({
  recieverEmail,
  recieverName,
  subject,
  html,
  customID,
}) => {
  const mailjet = MailJet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: '"EventCircle" <eventcircle01@gmail.com>',
          Name: "EventCircle",
        },
        To: [
          {
            Email: recieverEmail,
            Name: recieverName,
          },
        ],
        Subject: subject,
        HTMLPart: html,
        CustomID: customID,
      },
    ],
  });
  return request
    .then((result) => {
      console.log(result.body);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  SendVerifyEmail,
  AdminSetPasswordEmail,
  SendWebHookEmail,
  ResetPasswordEmail,
  SendEventPublishedEmail,
  SendContactAdminEmail
};
