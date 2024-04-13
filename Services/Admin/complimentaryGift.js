const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Create = async (data, image) => {
  let Data = await prisma.complimentarygift.create({
    data: {
      title: data.title,
      category: data.category,
      details: data.details,
      amount: parseFloat(data.amount),
      image: image,
      altImages: data.altImages,
    },
  });

  await prisma.$disconnect();
  return Data;
};

const Update = async (id, data, image) => {
  const complimentaryItem = await prisma.complimentarygift.findUnique({
    where: {
      id: id,
    },
  });

  if (complimentaryItem) {
    let Data = await prisma.complimentarygift.update({
      where: {
        id: id,
      },
      data: {
        image: image ? image : complimentaryItem.image,
        amount: data.amount
          ? parseFloat(data.amount)
          : complimentaryItem.amount,
        details: data.details ? data.details : complimentaryItem.details,
        category: data.category ? data.category : complimentaryItem.category,
        title: data.title ? data.title : complimentaryItem.title,
        altImages: altImages ? data.altImages : complimentaryItem.altImages
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let complimentarygift = await prisma.complimentarygift.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return complimentarygift;
};

module.exports = { Create, Update, Delete };
