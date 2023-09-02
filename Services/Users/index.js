const { PrismaClient } = require("@prisma/client");
const { SendEmail } = require("../../Utils/Email/EmailService");
const {
  comparePassword,
  GenerateOtp,
  VerifyToken,
  hashPassword,
} = require("../../Utils/HelperFunctions");
const { v4: uuidv4 } = require("uuid");
const prisma = new PrismaClient();

const GetUserNotifications = async (id) => {
  const notifications = await prisma.notifications.findMany({
    where: {
      userId: id,
    },
    orderBy: [
      {
        created_at: "desc",
      },
    ],
    take: 20,
  });
  await prisma.$disconnect();
  return notifications;
};

const UpdateNotifications = async (id) => {
  const notifications = await prisma.notifications.update({
    where: {
      id: id,
    },
    data: {
      read: true,
      updated_at: new Date(Date.now()),
    },
  });
  await prisma.$disconnect();
  return notifications;
};

const Create = async (data) => {
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    let Data = await prisma.user.create({
      data: {
        password: "",
        email: data.email,
        lastname: data.lastname,
        firstname: data.firstname,
        emailVerified: false,
      },
    });

    await prisma.$disconnect();

    return Data;
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

const GetUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return user;
};

const GetUsers = async () => {
  const users = await prisma.user.findMany();

  await prisma.$disconnect();
  return users;
};

const DeleteUser = async (id) => {
  let user = await prisma.user.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return user;
};

const UpdateUser = async (data, id) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (user) {
    let updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        gender: data.gender ? data.gender : user.gender,
        dob: data.dob ? data.dob : user.dob,
        tel: data.tel ? data.tel : user.tel,
        state: data.state ? data.state : user.state,
        placeOfResidence: data.residence
          ? data.residence
          : user.placeOfResidence,
        updated_at: new Date(Date.now()),
      },
    });
    const message = `Your profile has been updated`;
    const notification = await prisma.notifications.create({
      data: {
        userId: id,
        type: "USER_EDIT",
        message: message,
      },
    });

    await prisma.$disconnect();
    return { updatedUser, notification };
  }

  return null;
};

module.exports = {
  GetUserNotifications,
  UpdateNotifications,
  Create,
  GetUser,
  SetPassword,
  ChangePassword,
  GetUsers,
  UpdateUser,
  DeleteUser,
};
