const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetFundRaising = async (id) => {
  const fundRaising = await prisma.fundRaising.findMany({
    where: {
      eventId: id,
    },
  });
  await prisma.$disconnect();
  return fundRaising;
};

const GetCoHostFundRaising = async (eventId, coHostId) => {
  const fundRaising = await prisma.fundRaising.findFirst({
    where: {
      eventId: eventId,
      created_by: coHostId,
    },
  });
  await prisma.$disconnect();

  return fundRaising;
};

const Create = async (data, image, userId) => {
  const event = await prisma.event.findUnique({
    where: {
      id: data.eventId,
    },
  });

  if (event) {
    const FundRaising = await prisma.fundRaising.findFirst({
      where: {
        eventId: data.eventId,
        created_by: userId,
      },
    });

    if (FundRaising) {
      return FundRaising;
    }
    let fundRaising = await prisma.fundRaising.create({
      data: {
        eventId: data.eventId,
        amount: parseInt(data.amount),
        amountPaid: 0,
        active: true,
        image: image,
        title: data.title,
        description: data.description,
        created_by: userId,
      },
    });

    const message = `FundRaising has been created and is active`;
    const notification = await prisma.notifications.create({
      data: {
        userId: userId,
        type: "FUNDRAISING",
        message: message,
        referenceEvent: event.id,
      },
    });

    await prisma.$disconnect();
    return { fundRaising, notification };
  }
  return null;
};

const UpdateStatus = async (data) => {
  const fundRaising = await prisma.fundRaising.findUnique({
    where: {
      id: data.id,
    },
  });

  if (fundRaising) {
    let fund = await prisma.fundRaising.update({
      where: {
        id: data.id,
      },
      data: {
        active: data.status,
      },
    });

    await prisma.$disconnect();
    return fund;
  }
  return null;
};

const UpdateAmount = async (data) => {
  const fundRaising = await prisma.fundRaising.findUnique({
    where: {
      id: data.id,
    },
  });

  if (fundRaising) {
    let res = await prisma.fundRaising.update({
      where: {
        id: data.id,
      },
      data: {
        amount: data.amount,
      },
    });

    await prisma.$disconnect();
    return res;
  }
  return null;
};

const Donate = async (data, userId) => {
  const fundRaising = await prisma.fundRaising.findUnique({
    where: {
      id: data.fundId,
    },
  });

  if (!fundRaising) return null;

  const donation = await prisma.fundRaisingDonation.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.tel,
      amount: parseInt(data.amount),
      fundId: data.fundId,
      created_by: userId,
    },
  });

  return donation;
};

const GetFundDonors = async (id) => {
  let donors = await prisma.fundRaisingDonation.findMany({
    where: {
      fundId: id,
    },
    select: {
      firstName: true,
      lastName: true,
      amount: true,
      id: true,
      created_at: true,
    },
  });

  await prisma.$disconnect();
  return donors;
};

const DeleteFundRaising = async (id) => {
  let fundRaising = await prisma.fundRaising.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return fundRaising;
};

module.exports = {
  Create,
  GetFundRaising,
  GetCoHostFundRaising,
  UpdateAmount,
  UpdateStatus,
  Donate,
  GetFundDonors,
  DeleteFundRaising,
};
