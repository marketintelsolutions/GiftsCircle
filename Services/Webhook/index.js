const {
  PrismaClient,
  TransactionType,
  TransactionStatus,
  NOTIFICATION,
} = require("@prisma/client");

const TransformPayload = (payload) => {
  const { event, data } = payload;
  let payinData = {};
  switch (event) {
    case "charge.success":
      payinData.status = data.status;
      payinData.reference = data.reference;
      payinData.status = data.status;
      payinData.amount = data.amount / 100;
      payinData.paymentDate = data.paid_at;
      payinData.type = data.metadata?.type;
      payinData.eventId = data.metadata?.eventId;
      payinData.user = data.metadata?.user;
      payinData.senderName = `${data.customer_first_name}  ${data.customer.last_name} `;
      payinData.senderPhone = data.customer.phone;
      payinData.senderEmail = data.customer.email;
      payinData.products = data.metadata?.products;
      break;

    default:
      break;
  }
  return payinData;
};

const PayIn = async (payload) => {
  const data = TransformPayload(payload);
  let result;
  try {
    switch (data.type) {
      case "ASOEBI":
        result = await HandleAsoebiTrans(data);
        break;
      case "GIFT":
        result = await HandleGiftTrans(data);
        break;
      case "FUNDRAISING":
        result = await HandleFundRaisingTrans(data);
        break;
      case "MARKET":
        result = await HandleMarketTrans(data);
        break;
      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

const HandleAsoebiTrans = async (payload) => {
  const referenceId =
    payload.products.length === 1 ? payload.products[0].id : null;
  let prisma = new PrismaClient();
  let transaction;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: payload.user,
        },
      });
      if (!user) throw new Error("User not found");

      const event = await prisma.event.findUnique({
        where: {
          id: payload.eventId,
        },
      });
      if (!event) throw new Error("Event not found");

      await prisma.transaction.create({
        data: {
          type: TransactionType.ASOEBI,
          amount: payload.amount,
          purchasedBy: {
            connect: {
              id: user.id,
            },
          },
          quantity: 1,
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
        },
      });

      payload.products.forEach(async (ele) => {
        const asoebi = await prisma.asoebi.findUnique({
          where: {
            id: ele.id,
          },
        });
        await prisma.asoebi.update({
          where: {
            id: ele.id,
          },
          data: {
            amountPaid: asoebi.amountPaid + parseInt(ele.amount),
            quantity: asoebi.quantity + 1,
            updated_by: user.id,
          },
        });
      });

      const message = `${user.firstname} bought one quantity of asoebi`;
      const guestMessage = `You have bought one quantity of asoebi`;

      await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: "ASOEBI",
          message: message,
          referenceEvent: event.id,
        },
      });

      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: "PURCHASE",
          message: guestMessage,
        },
      });

      return true;
    });
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

const HandleGiftTrans = async (payload) => {
  const referenceId =
    payload.products.length === 1 ? payload.products[0].id : null;
  let prisma = new PrismaClient();
  let transaction;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: payload.user,
        },
      });
      if (!user) throw new Error("User not found");

      const event = await prisma.event.findUnique({
        where: {
          id: payload.eventId,
        },
      });
      if (!event) throw new Error("Event not found");

      await prisma.transaction.create({
        data: {
          type: TransactionType.GIFT,
          amount: payload.amount,
          purchasedBy: {
            connect: {
              id: user.id,
            },
          },
          quantity: 1,
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
        },
      });

      payload.products.forEach(async (ele) => {
        const gift = await prisma.gift.findUnique({
          where: {
            id: ele.id,
          },
        });
        let check =
          parseInt(gift.amountPaid) + parseInt(ele.amount) >
          parseInt(gift.giftItemAmount) * parseInt(gift.quantity) +
            parseInt(ele.deliveryAmount);

        await prisma.gift.update({
          where: {
            id: ele.id,
          },
          data: {
            purchased: check,
            status: ele.status,
            complimentaryGift: ele.complimentaryGift,
            amountPaid: parseInt(gift.amountPaid) + parseInt(ele.amount),
            updated_at: new Date(Date.now()),
          },
        });
      });

      const message = `${user.firstname} paid for some gifts for ${event.title} event`;
      await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: "PURCHASE",
          message: message,
          referenceEvent: event.id,
        },
      });

      const guestMessage = `Gifts for ${event.title} bought successfully`;
      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: "PURCHASE",
          message: guestMessage,
          referenceEvent: event.id,
        },
      });
      console.log("Payment   completed");
      return true;
    });
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

const HandleFundRaisingTrans = async (payload) => {
  const referenceId =
    payload.products.length === 1 ? payload.products[0].id : null;
  let prisma = new PrismaClient();
  let transaction;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: payload.user,
        },
      });
      if (!user) throw new Error("User not found");

      const event = await prisma.event.findUnique({
        where: {
          id: payload.eventId,
        },
      });
      if (!event) throw new Error("Event not found");

      const fundRaising = await prisma.fundRaising.findUnique({
        where: {
          id: payload.products[0].id,
        },
      });
      if (!fundRaising) throw new Error("FundRaising not found");

      await prisma.transaction.create({
        data: {
          type: TransactionType.FUNDRAISING,
          amount: payload.amount,
          purchasedBy: {
            connect: {
              id: user.id,
            },
          },
          quantity: 1,
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
        },
      });

      const message = `FundRaising: ${payload.products[0].firstName} donated ${payload.amount} to the FundRaising`;
      const guestMessage = `FundRaising: You made a donation to ${event.title} event fundRaising`;

      await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: NOTIFICATION.FUNDRAISING,
          message: message,
          referenceEvent: event.id,
        },
      });

      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: NOTIFICATION.FUNDRAISING,
          message: guestMessage,
          referenceEvent: event.id,
        },
      });

      await prisma.fundRaising.update({
        where: {
          id: fundRaising.id,
        },
        data: {
          amountPaid: fundRaising.amountPaid + parseInt(payload.amount),
        },
      });
      console.log("Payment   completed");
    });
    return true;
  } catch (error) {
    console.log(error, transaction);
    if (transaction) {
      console.log("Transaction rolled back due to an error.");
      await prisma.$queryRaw`ROLLBACK;`;
    }
  } finally {
    await prisma.$disconnect();
  }
};

const HandleMarketTrans = async (payload) => {
  const referenceId =
    payload.products.length === 1 ? payload.products[0].id : null;
  let prisma = new PrismaClient();
  let transaction;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: payload.user,
        },
      });
      if (!user) throw new Error("User not found");

      await prisma.transaction.create({
        data: {
          type: TransactionType.MARKET,
          amount: payload.amount,
          purchasedBy: {
            connect: {
              id: user.id,
            },
          },
          quantity: 1,
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          details: payload.products,
        },
      });

      const message = `Market Items purchased`;
      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: NOTIFICATION.PURCHASE,
          message: message,
        },
      });
      console.log("Payment   completed");
    });
    return true;
  } catch (error) {
    console.log(error, transaction);
    if (transaction) {
      console.log("Transaction rolled back due to an error.");
      await prisma.$queryRaw`ROLLBACK;`;
    }
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  PayIn,
};
