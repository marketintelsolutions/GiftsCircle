const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const UpdateFundraisingState = async (data) => {
  const fundRaising = await prisma.fundRaising.findUnique({
    where: {
      id: data.id,
    },
  });

  if (fundRaising) {
    let Data = await prisma.fundRaising.update({
      where: {
        id: fundRaising.id,
      },
      data: {
        withdrawn: data.withdrawn,
      },
    });

    await prisma.$disconnect();

    return Data;
  }
  await prisma.$disconnect();
  return null;
};

module.exports = {
  UpdateFundraisingState,
};
