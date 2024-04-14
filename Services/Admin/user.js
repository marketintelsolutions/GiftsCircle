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
    include: {
      Wallet: true,
    },
    orderBy: {
      created_at: "asc",
    },
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

const Withdraw = async (id, data) => {
  let user = await prisma.user.findFirst({
    where: {
      id: id,
    },
    include: {
      Wallet: true,
    },
  });
  if (user) {
    if (Number(data.amount) > Number(user.Wallet[0].balance))
      throw new Error("Insufficient funds");
    const currentBalance = Number(user.Wallet[0].balance) - Number(data.amount);
    await prisma.wallet.update({
      where: { id: user.Wallet[0].id },
      data: { balance: currentBalance },
    });
  }

  await prisma.$disconnect();
  return user;
};

module.exports = {
  GetUser,
  GetUsers,
  DeleteUser,
  Withdraw,
};
