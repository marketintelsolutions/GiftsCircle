const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAllEvents = async () => {
  const events = await prisma.event.findMany({});

  await prisma.$disconnect();
  return events;
};

module.exports = {
  GetAllEvents,
};
