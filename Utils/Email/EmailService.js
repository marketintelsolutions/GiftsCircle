const MailJet = require("node-mailjet");
const { formatAmount } = require("../HelperFunctions");
const { resolve } = require("path");
const pug = require("pug");

const SendEmail = async (reciever, name, data) => {
  const mailjet = MailJet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "godwillonyewuchii@gmail.com",
          Name: "EventCircle",
        },
        To: [
          {
            Email: reciever,
            Name: name,
          },
        ],
        TemplateID: 4630318,
        TemplateLanguage: true,
        Subject: "Verify Email",
        Variables: {
          name: name,
          otp: data,
        },
      },
    ],
  });
  return request;
};

const SendResetEmail = async (reciever, name, data) => {
  const mailjet = MailJet.apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
  );
  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "godwillonyewuchii@gmail.com",
          Name: "EventCircle",
        },
        To: [
          {
            Email: reciever,
            Name: name,
          },
        ],
        TemplateID: 4630335,
        TemplateLanguage: true,
        Subject: "Reset Password",
        Variables: {
          name: "Sir",
          confirmationlink: data,
        },
      },
    ],
  });
  return request;
};

const SendWebHookEmail = async (
  recieverName,
  recieverEmail,
  amount,
  deliveryAmount,
  products
) => {
  const templatePath = resolve(__dirname, "./views/templates/Payment.pug");
  products = products.map((ele) => {
    ele.amount = formatAmount(ele.amount);
    return ele;
  });

  const compiledFunction = pug.compileFile(templatePath);
  const html = compiledFunction({
    amount: formatAmount(amount),
    products: products,
    deliveryFee: deliveryAmount || deliveryAmount !== 0 ? formatAmount(parseInt(deliveryAmount)) : 0,
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
          Email: "godwillonyewuchii@gmail.com",
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

module.exports = { SendEmail, SendResetEmail, SendWebHookEmail };
