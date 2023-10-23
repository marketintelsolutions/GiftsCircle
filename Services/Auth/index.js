const { PrismaClient } = require("@prisma/client");
const ResponseDTO = require("../../DTO/Response");
const { SendEmail, SendResetEmail } = require("../../Utils/Email/EmailService");
const {
  comparePassword,
  GenerateOtp,
  GenerateToken,
} = require("../../Utils/HelperFunctions");

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
      let token = GenerateToken(data.email, user.id, "USER", "1h");
      let returnedUser = { ...user };
      delete returnedUser.password;

      return { token, user:returnedUser };
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
    let token = GenerateToken(user.email, user.id, "USER", "1h");
    await prisma.$disconnect();
    let returnedUser = { ...user };
    delete returnedUser.password;

    return { token, user:returnedUser };
  }
  return null;
};

const SendVerifyEmail = async (data) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (user) {
      return null;
    }

    let otp = GenerateOtp();
    var expires = new Date(Date.now());
    expires.setMinutes(expires.getMinutes() + 10);

    await prisma.otp.create({
      data: {
        user: data.email,
        code: otp,
        expires: expires,
      },
    });

    let result = await SendEmail(data.email, data.firstname, otp);
    return result.response;
  } catch (error) {
    console.log(error);
  }
};

const VerifyOtp = async (data) => {
  try {
    const otp = await prisma.otp.findFirst({
      where: { code: data.code },
    });
    if (otp && data.user === otp.user) {
      var currentDate = new Date();
      var expires = otp.expires;
      if (currentDate < expires) {
        return ResponseDTO("Success", "Email has been verified");
      } else {
        return ResponseDTO("Failed", "Otp has Expired");
      }
    }
    return ResponseDTO("Failed", "Otp is Invalid");
  } catch (error) {
    console.log(error);
    return ResponseDTO("Failed", "Request Failed");
  }
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
