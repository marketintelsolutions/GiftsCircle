const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAsoebiTrans = async (id) => {
  const asoebiTrans = await prisma.asoebiTransaction.findMany({
    where: {
      asoebiId: id,
    },
  });
  await prisma.$disconnect();
  return asoebiTrans;
};

const GetEventAsoebisTrans = async (id) => {
  const asoebiTrans = await prisma.asoebiTransaction.findMany({
    where: {
      eventId: id,
    },
  });
  await prisma.$disconnect();
  return asoebiTrans;
};

const UpdateAsoebiTrans = async (data) => {
  const asoebi = await prisma.asoebiTransaction.findUnique({
    where: {
      id: data.id,
    },
  });

  if (asoebi) {
    let Data = await prisma.asoebiTransaction.update({
      where: {
        id: asoebi.id,
      },
      data: {
        delivered: data.delivered,
      },
    });

    await prisma.$disconnect();

    return Data;
  }
  await prisma.$disconnect();
  return null;
};

module.exports = { GetAsoebiTrans, GetEventAsoebisTrans, UpdateAsoebiTrans };
