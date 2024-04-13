const { PrismaClient } = require("@prisma/client");
const { SendEmail } = require("../../Utils/Email/EmailService");
const {
  comparePassword,
  GenerateOtp,
  VerifyToken,
  hashPassword,
  Id_Generator,
} = require("../../Utils/HelperFunctions");
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
  let prisma = new PrismaClient();
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      if (data.referralCode) {
        const referrer = await prisma.user.findFirst({
          where: {
            referralCode: data.referralCode,
            referralActive: true,
          },
        });
        if (referrer) data.referredBy = referrer.id;
      }
      const referralCode = Id_Generator(7, true, false, false, false);
      const user = await prisma.user.findFirst({
        where: {
          email: data.email,
          referralCode: referralCode,
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
            referralCode: referralCode,
          },
        });

        await prisma.wallet.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        await prisma.$disconnect();

        result = Data;
      }
      result = null;
    });
    return result;
  } catch (error) {
    console.log(error);
    if (transaction) {
      console.log("Transaction rolled back due to an error.");
      await prisma.$queryRaw`ROLLBACK;`;
    }
  } finally {
    await prisma.$disconnect();
  }
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
