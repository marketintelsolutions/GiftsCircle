const { PrismaClient, TransactionType } = require("@prisma/client");
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

const Create = async (data) => {
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
    element.userId = userId;
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
  const asoebi = await prisma.asoebi.findUnique({
    where: {
      id: data.asoebiId,
    },
  });
  if (!asoebi) return null;

  const buy = await prisma.asoebiTransaction.create({
    data: {
      amount: parseInt(data.amount),
      eventId: data.eventId,
      quantity: data.quantity,
      delivered: false,
      asoebiitem: {
        connect: {
          id: asoebi.asoebiItem,
        },
      },
      purchasedBy: {
        connect: {
          id: userId,
        },
      },
      aseobi: {
        connect: {
          id: asoebi.id,
        },
      },
    },
  });
  return buy;
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
