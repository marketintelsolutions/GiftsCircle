const {
  PrismaClient,
  TransactionType,
  TransactionStatus,
  NOTIFICATION,
} = require("@prisma/client");
const { SendWebHookEmail } = require("../../Utils/Email/EmailService");
const prismaGen = new PrismaClient();

const transaction_percent = process.env.COMISSION_PERCENT;

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
      payinData.transactionRef = data.reference;
      payinData.deliveryFee = data.metadata?.deliveryFee;
      break;

    default:
      break;
  }
  return payinData;
};

const PayIn = async (payload) => {
  const data = TransformPayload(payload);
  const checkRef = await checkRefExist(data.transactionRef);
  if (checkRef) return;
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
  let prismaTransaction;
  let user;
  try {
    prismaTransaction = await prisma.$transaction(async (prisma) => {
      user = await prisma.user.findFirst({
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
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
          transactionRef: payload.transactionRef,
        },
      });

      if (user.referredBy) {
        const referrer = await prisma.user.findFirst({
          where: {
            id: user.referredBy,
          },
        });
        if (referrer) {
          const wallet = await prisma.wallet.findFirst({
            where: { user: { id: referrer.id } },
          });
          if (wallet) {
            const currentBalance = Math.ceil(
              Number(wallet.balance) +
                payload.amount * (transaction_percent / 100)
            );
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: currentBalance,
              },
            });
          }
        }
      }
      const asoebiUpdates = [];

      for (const ele of payload.products) {
        const asoebi = await prisma.asoebi.findUnique({
          where: {
            id: ele.id,
          },
        });

        if (asoebi) {
          asoebiUpdates.push(
            prisma.asoebi.update({
              where: {
                id: ele.id,
              },
              data: {
                amountPaid: asoebi.amountPaid + parseInt(ele.amount),
                quantity: asoebi.quantity + 1,
                updated_by: user.id,
              },
            })
          );
        }
      }

      await Promise.all(asoebiUpdates);

      const message = `${user.firstname} bought one quantity of asoebi`;
      const guestMessage = `You have bought one quantity of asoebi`;

      await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: NOTIFICATION.PURCHASE,
          message: message,
          referenceEvent: event.id,
        },
      });

      await prisma.notifications.create({
        data: {
          userId: user.id,
          type: NOTIFICATION.PURCHASE,
          message: guestMessage,
        },
      });
    });

    await SendWebHookEmail(
      user.firstname,
      user.email,
      payload.amount,
      payload.deliveryFee,
      payload.products
    );
  } catch (error) {
    console.log(error);
    if (prismaTransaction) {
      console.log("Transaction rolled back due to an error.");
      // Rollback the transaction if it was initiated
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
  let user;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      user = await prisma.user.findFirst({
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
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
          transactionRef: payload.transactionRef,
        },
      });

      if (user.referredBy) {
        const referrer = await prisma.user.findFirst({
          where: {
            id: user.referredBy,
          },
        });
        if (referrer) {
          const wallet = await prisma.wallet.findFirst({
            where: { user: { id: referrer.id } },
          });
          if (wallet) {
            const currentBalance = Math.ceil(
              Number(wallet.balance) +
                payload.amount * (transaction_percent / 100)
            );
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: currentBalance,
              },
            });
          }
        }
      }

      const giftUpdates = [];

      for (const ele of payload.products) {
        const gift = await prisma.gift.findUnique({
          where: {
            id: ele.id,
          },
        });

        if (gift) {
          let check =
            parseInt(gift.amountPaid) + parseInt(ele.amount) >
            parseInt(gift.giftItemAmount) * parseInt(gift.quantity) +
              parseInt(ele.deliveryAmount);

          giftUpdates.push(
            prisma.gift.update({
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
            })
          );
        }
      }

      await Promise.all(giftUpdates);

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
    });
    await SendWebHookEmail(
      user.firstname,
      user.email,
      payload.amount,
      payload.deliveryFee,
      payload.products
    );
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
  let user;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      user = await prisma.user.findFirst({
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
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          eventId: event.id,
          details: payload.products,
          transactionRef: payload.transactionRef,
        },
      });

      if (user.referredBy) {
        const referrer = await prisma.user.findFirst({
          where: {
            id: user.referredBy,
          },
        });
        if (referrer) {
          const wallet = await prisma.wallet.findFirst({
            where: { user: { id: referrer.id } },
          });
          if (wallet) {
            const currentBalance = Math.ceil(
              Number(wallet.balance) +
                payload.amount * (2.5 / 100)
            );
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: currentBalance,
              },
            });
          }
        }
      }

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

      const paystackFeePercentage = 0.015;
      const amountWithoutPaystackFee = parseInt(payload.amount) / (1 + paystackFeePercentage);
      const amountPaid = fundRaising.amountPaid + Math.round(amountWithoutPaystackFee);
      await prisma.fundRaising.update({
        where: {
          id: fundRaising.id,
        },
        data: {
          amountPaid: amountPaid,
        },
      });

      console.log("Payment   completed");
    });
    await SendWebHookEmail(
      user.firstname,
      user.email,
      payload.amount,
      0,
      payload.products
    );
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
  let user;

  try {
    transaction = await prisma.$transaction(async (prisma) => {
      user = await prisma.user.findFirst({
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
          status: TransactionStatus.SUCCESS,
          referenceId: referenceId,
          details: payload.products,
          transactionRef: payload.transactionRef,
        },
      });

      if (user.referredBy) {
        const referrer = await prisma.user.findFirst({
          where: {
            id: user.referredBy,
          },
        });
        if (referrer) {
          const wallet = await prisma.wallet.findFirst({
            where: { user: { id: referrer.id } },
          });
          if (wallet) {
            const currentBalance = Math.ceil(
              Number(wallet.balance) +
                payload.amount * (transaction_percent / 100)
            );
            await prisma.wallet.update({
              where: { id: wallet.id },
              data: {
                balance: currentBalance,
              },
            });
          }
        }
      }

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
    await SendWebHookEmail(
      user.firstname,
      user.email,
      payload.amount,
      payload.deliveryFee,
      payload.products
    );
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

const checkRefExist = async (ref) => {
  const checkRef = await prismaGen.transaction.findFirst({
    where: {
      transactionRef: ref,
    },
  });

  return checkRef;
};

module.exports = {
  PayIn,
};
