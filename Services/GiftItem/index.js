const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (id) => {
  const giftItem = await prisma.giftitem.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return giftItem;
};

const GetAll = async () => {
  const giftItems = await prisma.giftitem.findMany({
    // include: {
    //   GiftItemCategory: {
    //     include: {
    //       category: true,
    //     },
    //   },
    // },
  });
  await prisma.$disconnect();
  return giftItems;
};

const searchGiftItemsByCategorySlug = async (categorySlug) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        OR: [
          { slug: categorySlug },
          { subCategories: { some: { slug: categorySlug } } },
        ],
      },
      include: {
        GiftItemCategory: {
          include: {
            giftItem: true,
          },
        },
      },
    });

    if (!category) {
      return null;
    }

    return category;
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

const Create = async (data, image) => {
  let transaction;
  let result;

  try {
    transaction = await prisma.$transaction(async (prisma) => {
      result = await prisma.giftitem.create({
        data: {
          title: data.title,
          category: data.category,
          details: data.details,
          amount: parseInt(data.amount),
          image: image,
          weight: parseInt(data.weight),
          GiftItemCategory: {
            create: data.categories.map((c) => ({ categoryId: parseInt(c) })),
          },
        },
      });
    });
    return result;
  } catch (error) {
    if (transaction) {
      console.log("Transaction rolled back due to an error.");
      await prisma.$queryRaw`ROLLBACK;`;
    }
  } finally {
    await prisma.$disconnect();
  }
};

const Update = async (id, data, image) => {
  const giftItem = await prisma.giftitem.findUnique({
    where: {
      id: id,
    },
  });

  if (giftItem) {
    let Data = await prisma.giftitem.update({
      where: {
        id: id,
      },
      data: {
        image: image ? image : giftItem.image,
        amount: data.amount ? parseInt(data.amount) : giftItem.amount,
        details: data.details ? data.details : giftItem.details,
        category: data.category ? data.category : giftItem.category,
        title: data.title ? data.title : giftItem.title,
        weight: data.weight ? data.weight : giftItem.weight,
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let giftItem = await prisma.giftitem.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return giftItem;
};

module.exports = {
  Create,
  Get,
  GetAll,
  Update,
  Delete,
  searchGiftItemsByCategorySlug,
};
