const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAll = async (id) => {
  const cartItems = await prisma.cart.findMany({
    where: {
      userId: id,
    },
  });

  await prisma.$disconnect();
  return cartItems;
};

const Create = async (data, userId) => {
  let Data = await prisma.cart.create({
    data: {
      title: data.title,
      details: data.details,
      amount: parseFloat(data.amount),
      image: data.image,
      quantity: data.quantity,
      user: {
        connect: {
          id: userId,
        },
      },
      itemId: data.itemId,
      itemType: data.itemType,
      weight: data.weight
    },
  });

  await prisma.$disconnect();
  return Data;
};


const Update = async (id, data) => {
  const cart = await prisma.cart.findUnique({
    where: {
      id: id,
    },
  });

  if (cart) {
    let Data = await prisma.cart.update({
      where: {
        id: id,
      },
      data: {
        quantity: data.quantity
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let cart = await prisma.cart.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return cart;
};

module.exports = { Create, GetAll, Update, Delete };
