const { PrismaClient } = require("@prisma/client");
const {
  comparePassword,
  GenerateToken,
} = require("../Auth/services");

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
  GetAdmin,
  GetAdmins,
};
