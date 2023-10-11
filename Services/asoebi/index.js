const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (id) => {
  const asoebi = await prisma.asoebi.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return asoebi;
};

const GetAll = async () => {
  const asoebi = await prisma.asoebi.findMany();

  await prisma.$disconnect();
  return asoebi;
};

const GetEventAsoebi = async (id) => {
  const asoebis = await prisma.asoebi.findMany({
    where: {
      eventId: id,
    },
  });
  await prisma.$disconnect();
  return asoebis;
};

const Create = async (data, userId) => {
  let Data = await prisma.asoebi.create({
    data: {
      quantity: 0,
      amountPaid: 0,
      asoebiItem: data.asoebiItem,
      eventId: data.eventId,
      increment: data.increment,
      purchasedByHost: data.purchasedByHost,
    },
  });

  await prisma.$disconnect();
  return Data;
};

const CreateMany = async (data, userId) => {
  data.forEach((element) => {
    element.amountPaid = 0;
    element.userId = userId
    element.quantity = 0;
    return element;
  });
  await prisma.asoebi.createMany({
    data: [...data],
    skipDuplicates: true,
  });

  const message = `Asoebis has been added for guest`;
  const notification = await prisma.notifications.create({
    data: {
      userId: userId,
      type: "ASOEBI",
      message: message,
      referenceEvent: data.eventId,
    },
  });
  await prisma.$disconnect();
  return { data, notification };
};

const Delete = async (id) => {
  let asoebi = await prisma.asoebi.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return asoebi;
};

const Buy = async (data, userId) => {
  let prisma = new PrismaClient()
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const asoebi = await prisma.asoebi.findUnique({
        where: {
          id: data.asoebiId,
        },
      });

      if (asoebi) {
        const buy = await prisma.asoebiTransaction.create({
          data: {
            amount: parseInt(data.amount),
            asoebiId: data.asoebiId,
            userId: userId,
            eventId: data.eventId,
            quantity: data.quantity,
            delivered: false,
            asoebiitemId: asoebi.asoebiItem,
          },
        });

        await prisma.asoebi.update({
          where: {
            id: asoebi.id,
          },
          data: {
            amountPaid: asoebi.amountPaid + parseInt(data.amount),
            quantity: asoebi.quantity + data.quantity,
            updated_by: userId,
          },
        });

        const user = await prisma.user.findFirst({
          where: { id: userId },
        });
        const event = await prisma.event.findUnique({
          where: { id: data.eventId },
        });
        const message = `${user.firstname} bought ${data.quantity} quantity of asoebi`;
        const guestMessage = `You have bought ${data.quantity} quantity of asoebi`;
        const notification = await prisma.notifications.create({
          data: {
            userId: event.userId,
            type: "ASOEBI",
            message: message,
            referenceEvent: event.id,
          },
        });

        const guestNotification = await prisma.notifications.create({
          data: {
            userId: userId,
            type: "PURCHASE",
            message: guestMessage,
          },
        });

        result = { buy, notification, guestNotification };
      } else {
        result = null;
      }
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

const GetAsoebiBuyers = async (id) => {
  let buyers = await prisma.asoebiTransaction.findMany({
    where: {
      eventId: id,
    },
    select: {
      amount: true,
      quantity: true,
      purchasedBy: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
      id: true,
      created_at: true,
    },
  });

  await prisma.$disconnect();
  return buyers;
};

module.exports = {
  Create,
  Get,
  GetAll,
  Delete,
  CreateMany,
  Buy,
  GetEventAsoebi,
  Buy,
  GetAsoebiBuyers,
};
