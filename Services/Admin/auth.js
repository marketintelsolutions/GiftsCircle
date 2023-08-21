const { PrismaClient } = require("@prisma/client");
const ResponseDTO = require("../../DTO/Response");
const { SendEmail, SendResetEmail } = require("../../Utils/Email/EmailService");
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../Users/service");
const { VerifyToken, comparePassword, GenerateToken, GenerateOtp } = require("../Auth/services");

const prisma = new PrismaClient();

const Login = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
      role: "ADMIN",
    },
  });
  if (user) {
    let checkPasssword = await comparePassword(data.password, user.password);
    if (checkPasssword) {
      await prisma.$disconnect();
      let token = GenerateToken(data.email, "ADMIN", "4h");
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
      role: "ADMIN",
    },
  });

  if (user) {
    let token = GenerateToken(user.email, "ADMIN", "4h");
    await prisma.$disconnect();
    return { token, user };
  }
  return null;
};

const SendVerifyEmail = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      role: "ADMIN",
    },
  });

  if (user) {
    try {
      let otp = GenerateOtp();
      var expires = new Date();
      expires.setMinutes(expires.getMinutes() + 10);
      expires = new Date(expires);

      await prisma.otp.create({
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
      role: "ADMIN",
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
      role: "ADMIN",
    },
  });

  if (user) {
    try {
      let token = GenerateToken(email, "ADMIN", "30m");
      let url =
        process.env.env === "development"
          ? "http://localhost:3000"
          : "https://giftscircle.netlify.app";
      let data = `${url}/admin/change_password?token=${token}`;
      let result = await SendResetEmail(email, user.firstname, data);
      return result.response;
    } catch (error) {
      console.log(error);
    }
  }
  return null;
};

const Create = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
      role: "ADMIN",
    },
  });

  if (!user) {
    await prisma.user.create({
      data: {
        password: "",
        role: "ADMIN",
        email: data.email,
        lastname: data.lastname,
        firstname: data.firstname,
        emailVerified: false,
        id: id,
      },
    });

    let otp = GenerateOtp();
    var expires = new Date();
    expires.setMinutes(expires.getMinutes() + 1);
    expires = new Date(expires);

    await prisma.otp.create({
      data: {
        id: uuidv4(),
        user: data.email,
        code: otp,
        expires: expires,
      },
    });

    await SendEmail(data.email, data.firstname, otp);
    await prisma.$disconnect();

    return data;
  }
  return null;
};

const SetPassword = async (data, type) => {
  let token_data = null;
  if (type === "RESET") {
    token_data = VerifyToken(data.auth);
  }
  const user = await prisma.user.findFirst({
    where: {
      email: token_data ? token_data.email : data.auth,
    },
  });
  if (user) {
    let hashedPassword = await hashPassword(data.password);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        updated_at: new Date(Date.now()),
      },
    });

    await prisma.$disconnect();
    return user;
  }
  return null;
};

const ChangePassword = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
      role: "ADMIN",
    },
  });

  if (user) {
    let checkPassword = await comparePassword(data.oldPassword, user.password);

    if (checkPassword) {
      let hashedPassword = await hashPassword(data.newPassword);
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
          updated_at: new Date(Date.now()),
        },
      });
    }

    await prisma.$disconnect();
    return user;
  }
  return null;
};

const GetAdmin = async (id) => {
  const admin = await prisma.user.findUnique({
    where: {
      id: id,
      role: "ADMIN",
    },
  });

  await prisma.$disconnect();
  return admin;
};

const GetAdmins = async () => {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
  });

  await prisma.$disconnect();
  return admins;
};

module.exports = {
  Login,
  Create,
  ChangePassword,
  SetPassword,
  GetAdmin,
  GetAdmins,
  GoogleSignIn,
  VerifyOtp,
  SendVerifyEmail,
  SendResetPasswordEmail,
};
