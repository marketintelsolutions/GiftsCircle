const { PrismaClient } = require("@prisma/client");
const ResponseDTO = require("../../DTO/Response");
const { SendEmail, SendResetEmail } = require("../../Utils/Email/EmailService");
const { comparePassword, GenerateOtp, GenerateToken } = require("../../Utils/HelperFunctions");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const Login = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (user) {
    let checkPasssword = await comparePassword(data.password, user.password);
    if (checkPasssword) {
      await prisma.$disconnect();
      let token = GenerateToken(data.email, "USER", "4h");
      return { token, user };
    }

    return null;
  }
  return null;
};

const GoogleSignIn = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user) {
    let token = GenerateToken(user.email, "USER", "4h");
    await prisma.$disconnect();
    return { token, user };
  }
  return null;
};

const SendVerifyEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    try {
      let otp = GenerateOtp();
      var expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10);
      expires = new Date(expires);

      let data = await prisma.otp.create({
        data: {
          id: uuidv4(),
          user: user.email,
          code: otp,
          expires: expires,
        },
      });

      let result = await SendEmail(email, user.firstname, otp);
      return result.response;
    } catch (error) {
      console.log(error);
    }
  }
  return null;
};

const VerifyOtp = async (data) => {
  const otp = await prisma.otp.findFirst({
    where: {
      code: data.code,
    },
  });
  const user = await prisma.user.findFirst({
    where: {
      email: otp.user,
    },
  });

  if (otp && data.user === otp.user) {
    try {
      var currentDate = new Date().getTime();
      var expires = new Date(otp.expires).getTime();
      if (expires > currentDate) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            emailVerified: true,
          },
        });

        return ResponseDTO("Success", "Email has been verified");
      } else {
        return ResponseDTO("Failed", "Otp has Expired");
      }
    } catch (error) {
      console.log(error);
      return ResponseDTO("Failed", "Request Failed");
    }
  }
  return ResponseDTO("Failed", "Otp is Invalid");
};

const SendResetPasswordEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    try {
      let token = GenerateToken(email, "USER", "30m");
      let url =
        process.env.env === "development"
          ? "http://localhost:3000"
          : "https://giftscircle.netlify.app";
      let data = `${url}/change_password?token=${token}`;
      let result = await SendResetEmail(email, user.firstname, data);
      return result.response;
    } catch (error) {
      console.log(error);
    }
  }
  return null;
};

module.exports = {
  Login,
  GoogleSignIn,
  VerifyOtp,
  SendVerifyEmail,
  SendResetPasswordEmail,
};
