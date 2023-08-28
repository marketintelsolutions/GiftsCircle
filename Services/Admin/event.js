const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAllEvents = async () => {
  const events = await prisma.event.findMany({});

  await prisma.$disconnect();
  return events;
};

const GetEventFundRaising = async (eventId) => {
  const fundRaising = await prisma.fundRaising.findMany({
    where: {
      eventId: eventId,
    },
  });
  await prisma.$disconnect();

  return fundRaising;
};

module.exports = {
  GetAllEvents,
  GetEventFundRaising,
};
