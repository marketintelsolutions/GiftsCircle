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
    include: {
      GiftItemCategory: {
        include: {
          category: true,
        },
      },
    },
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
  const prisma = new PrismaClient()
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      result = await prisma.giftitem.create({
        data: {
          title: data.title,
          details: data.details,
          amount: parseFloat(data.amount),
          image: image,
          weight: parseFloat(data.weight),
          altImages: data.altImages || [],
          GiftItemCategory: {
            create: data.categories.map((c) => ({ categoryId: parseInt(c) })),
          },
        },
      });
    });
    return result;
  } catch (error) {
    console.log(error)
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
        amount: data.amount ? parseFloat(data.amount) : giftItem.amount,
        details: data.details ? data.details : giftItem.details,
        title: data.title ? data.title : giftItem.title,
        weight: data.weight ? parseFloat(data.weight) : giftItem.weight,
        altImages: data.altImages ? data.altImages : giftItem.altImages,
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
