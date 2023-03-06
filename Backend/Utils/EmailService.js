const MailJet = require("node-mailjet");

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
          "Email": "godwillonyewuchii@gmail.com",
					"Name": "EventCircle"
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

module.exports = { SendEmail, SendResetEmail };
