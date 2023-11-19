const { PrismaClient } = require("@prisma/client");
const ResponseDTO = require("../../DTO/Response");
const { SendEmail, SendResetEmail } = require("../../Utils/Email/EmailService");
const {
  comparePassword,
  GenerateOtp,
  GenerateToken,
  GenerateRefreshToken,
  VerifyRefreshToken,
} = require("../../Utils/HelperFunctions");

const prisma = new PrismaClient();

const Login = async (data) => {
  let user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });
  if (user) {
    let checkPasssword = await comparePassword(data.password, user.password);
    if (checkPasssword) {
      await prisma.$disconnect();
      let accessToken = GenerateToken(data.email, user.id, "USER", "1h");
      let refreshToken = GenerateRefreshToken(user.email);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: refreshToken,
        },
      });
      await prisma.$disconnect();
      let returnedUser = { ...user };
      delete returnedUser.password;
      delete returnedUser.refreshToken;

      return { accessToken, refreshToken, user: returnedUser };
    }

    return null;
  }
  return null;
};

const GoogleSignIn = async (data) => {
  let user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (user) {
    let accessToken = GenerateToken(user.email, user.id, "USER", "1h");
    let refreshToken = GenerateRefreshToken(user.email, user.role);
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshToken,
      },
    });
    await prisma.$disconnect();
    let returnedUser = { ...user };
    delete returnedUser.password;
    delete returnedUser.refreshToken;

    return { accessToken, refreshToken, user: returnedUser };
  }
  return null;
};

const SendVerifyEmail = async (data) => {
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
};

const VerifyOtp = async (data) => {
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
};

const SendResetPasswordEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    let token = GenerateToken(email, user.id, "USER", "30m");
    let url =
      process.env.env === "development"
        ? "http://localhost:3000"
        : "https://giftscircle.netlify.app";
    let data = `${url}/change_password?token=${token}`;
    let result = await SendResetEmail(email, user.firstname, data);
    return result.response;
  }
  return null;
};

const RefreshToken = async (data) => {
  const refreshToken = VerifyRefreshToken(data.refresh_token);
  const currentDate = new Date().getTime();

  if (refreshToken.exp <= currentDate / 1000) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: { email: data.email },
  });
  if (!user || data.refresh_token !== user.refreshToken) {
    return null;
  } else {
    const token = GenerateToken(user.email, user.id, user.role, "1h");
    return { access_token: token };
  }
};

const Logout = async (id) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: id },
  });

  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: null,
    },
  });

  await prisma.$disconnect();
  return result;
};
module.exports = {
  Login,
  GoogleSignIn,
  VerifyOtp,
  SendVerifyEmail,
  SendResetPasswordEmail,
  RefreshToken,
  Logout,
};
