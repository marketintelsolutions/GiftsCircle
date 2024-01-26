const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (id) => {
  const seasonalItem = await prisma.seasonalitem.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return seasonalItem;
};

const GetAll = async () => {
  const seasonalItems = await prisma.seasonalitem.findMany({
    include: {
      SeasonalItemCategory: {
        include: {
          category: true,
        },
      },
    },
  });
  await prisma.$disconnect();
  return seasonalItems;
};

const searchSeasonalItemsByCategorySlug = async (categorySlug) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        OR: [
          { slug: categorySlug },
          { subCategories: { some: { slug: categorySlug } } },
        ],
      },
      include: {
        SeasonalItemCategory: {
          include: {
            seasonalitem: true,
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
  const prisma = new PrismaClient();
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      result = await prisma.seasonalitem.create({
        data: {
          title: data.title,
          details: data.details,
          amount: parseFloat(data.amount),
          image: image,
          weight: parseFloat(data.weight),
          altImages: JSON.parse(data.altImages) || [],
          SeasonalItemCategory: {
            create: JSON.parse(data?.categories).map((c) => ({ categoryId: parseInt(c) })),
          },
        },
      });
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

const Update = async (id, data, image) => {
  const seasonalItem = await prisma.seasonalitem.findUnique({
    where: {
      id: id,
    },
  });

  if (seasonalItem) {
    let Data = await prisma.seasonalitem.update({
      where: {
        id: id,
      },
      data: {
        image: image ? image : seasonalItem.image,
        amount: data.amount ? parseFloat(data.amount) : seasonalItem.amount,
        details: data.details ? data.details : seasonalItem.details,
        title: data.title ? data.title : seasonalItem.title,
        weight: data.weight ? parseFloat(data.weight) : seasonalItem.weight,
        altImages: data.altImages ? data.altImages : seasonalItem.altImages,
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let seasonalItem = await prisma.seasonalitem.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return seasonalItem;
};

module.exports = {
  Create,
  Get,
  GetAll,
  Update,
  Delete,
  searchSeasonalItemsByCategorySlug,
};
