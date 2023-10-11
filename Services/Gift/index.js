const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const prisma = new PrismaClient();

const Get = async (id) => {
  const gift = await prisma.gift.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return gift;
};

const GetAll = async () => {
  const gifts = await prisma.gift.findMany();

  await prisma.$disconnect();
  return gifts;
};

const GetEventGifts = async (id) => {
  const gifts = await prisma.gift.findMany({
    where: {
      eventId: id,
    },
  });

  await prisma.$disconnect();
  return gifts;
};

const GetEventGiftsByHost = async (id, userId) => {
  const gifts = await prisma.gift.findMany({
    where: {
      eventId: id,
      created_by: userId,
    },
  });
  await prisma.$disconnect();
  return gifts;
};

const GetUserPurchasedGifts = async (id) => {
  const gifts = await prisma.giftTransaction.findMany({
    where: {
      userId: id,
    },
    include: {
      gift: {
        select: {
          giftitemId: true,
          status: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  return gifts;
};

const GetUserEventPurchasedGifts = async (id, eventId) => {
  const gifts = await prisma.giftTransaction.findMany({
    where: {
      userId: id,
      eventId: eventId,
    },
    include: {
      gift: {
        select: {
          giftitemId: true,
          status: true,
          complimentaryGift: true,
        },
      },
      complimentaryGift: {
        select: {
          id: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  return gifts;
};

const GetEventGiftTransactions = async (id) => {
  const transactions = await prisma.giftTransaction.findMany({
    where: {
      eventId: id,
    },
    include: {
      purchasedBy: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
      gift: {
        select: {
          giftitemId: true,
          status: true,
          complimentaryGift: true,
          created_by: true,
        },
      },
      complimentaryGift: {
        select: {
          id: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  return transactions;
};

const GetCoHostEventGiftTransactions = async (userId, id) => {
  const transactions = await prisma.giftTransaction.findMany({
    where: {
      eventId: id,
      gift: {
        created_by: userId,
      },
    },
    include: {
      purchasedBy: {
        select: {
          firstname: true,
          lastname: true,
        },
      },
      gift: {
        select: {
          giftitemId: true,
          status: true,
          complimentaryGift: true,
          created_by: true,
          userId: true,
        },
      },
      complimentaryGift: {
        select: {
          id: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  return transactions;
};

const Create = async (data, userId) => {
  let id = uuidv4();
  await prisma.gift.create({
    data: {
      id: id,
      enableContribution: data.enableContribution,
      purchased: false,
      eventId: data.eventId,
      quantity: data.quantity ? data.quantity : 1,
      status: "UnPaid",
      user: {
        connect: {
          userId: userId,
        },
      },
      amountPaid: 0,
      giftitemId: data.giftitemId,
      complimentaryGift: data.complimentaryGift,
    },
  });

  await prisma.$disconnect();
  return data;
};

const CreateMany = async (data, userId) => {
  data.forEach((element) => {
    element.id = uuidv4();
    (element.purchased = false),
      (element.status = "UnPaid"),
      (element.amountPaid = 0);
    element.giftitemId = element.giftitemId;
    element.created_by = userId;

    return element;
  });
  await prisma.gift.createMany({
    data: [...data],
    skipDuplicates: true,
  });

  await prisma.$disconnect();
  return data;
};

const EnableContribution = async (data, id) => {
  let gift = null;
  if (id) {
    gift = await prisma.gift.findUnique({
      where: {
        id: id,
      },
    });
  } else {
    gift = await prisma.gift.findFirst({
      where: {
        giftitemId: data.giftitemId,
        eventId: data.eventId,
      },
    });
  }

  if (gift) {
    const data = await prisma.gift.update({
      where: {
        id: gift.id,
      },
      data: {
        enableContribution: true,
        updated_at: new Date(Date.now()),
      },
    });

    await prisma.$disconnect();
    return data;
  }
  return null;
};

const Buy = async (data, userId) => {
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      data.forEach(async (ele) => {
        let check =
          parseInt(ele.amountPaid) + parseInt(ele.amount) >
          parseInt(ele.giftItemAmount) * parseInt(ele.quantity) +
            parseInt(ele.deliveryAmount);

        await prisma.gift.update({
          where: {
            id: ele.giftId,
          },
          data: {
            purchased: check,
            status: ele.status,
            complimentaryGift: ele.complimentaryGift,
            amountPaid: parseInt(ele.amountPaid) + parseInt(ele.amount),
            updated_at: new Date(Date.now()),
          },
        });
      });

      data.forEach((element) => {
        delete element.status;
        delete element.complimentaryGift;
        delete element.amountPaid;
        delete element.giftItemAmount;
        delete element.deliveryAmount;

        element.amount = parseInt(element.amount);
        element.userId = userId

        element.quantity = 1;
        return element;
      });
      let transactions = await prisma.giftTransaction.createMany({
        data: [...data],
        skipDuplicates: true,
      });

      const user = await prisma.user.findFirst({ where: { id: userId } });
      const event = await prisma.event.findUnique({
        where: { id: data[0].eventId },
      });
      const message = `${user.firstname} paid for some gifts for ${event.title} event`;
      const notification = await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: "PURCHASE",
          message: message,
          referenceEvent: event.id,
        },
      });

      const guestMessage = `Gifts for ${event.title} bought successfully`;
      const guestNotification = await prisma.notifications.create({
        data: {
          userId: userId,
          type: "PURCHASE",
          message: guestMessage,
          referenceEvent: event.id,
        },
      });

      result = { transactions, notification, guestNotification };
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

const Delete = async (id) => {
  let gift = await prisma.gift.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return gift;
};

module.exports = {
  Create,
  Get,
  GetAll,
  GetEventGifts,
  GetEventGiftsByHost,
  GetEventGiftTransactions,
  GetUserEventPurchasedGifts,
  Delete,
  CreateMany,
  Buy,
  EnableContribution,
  GetUserPurchasedGifts,
  GetCoHostEventGiftTransactions,
};
