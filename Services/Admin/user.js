const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
  const users = await prisma.user.findMany({
    include:{
      Wallet: true
    }
  });

  const updatedUsers = users.map(async (ele) => {
    if (ele.referredBy) {
      const user = await prisma.user.findUnique({
        where: { id: ele.referredBy },
      });
      if (user) {
        ele.referredBy = `${user.firstname} ${user.lastname}`;
      }
    }
    return ele;
  });

  const result = await Promise.all(updatedUsers);

  await prisma.$disconnect();
  return result;
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

module.exports = {
  GetUser,
  GetUsers,
  DeleteUser,
};
