const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (email) => {
  const messages = await prisma.contact.findMany({
    where: {
      email: email,
    },
  });

  await prisma.$disconnect();
  return messages;
};

const GetAll = async (page = 1, perPage = 20) => {
  const messages = await prisma.contact.findMany({
    take: perPage,
    skip: (page - 1) * perPage,
  });

  await prisma.$disconnect();
  return messages;
};

const Create = async (data) => {
  const Data = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
      subject: data.subject,
    },
  });
  await prisma.$disconnect();
  return Data;
};

module.exports = {
  Create,
  Get,
  GetAll,
};
