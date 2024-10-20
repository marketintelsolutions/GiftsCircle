const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const Get = async (id) => {
  const asoebiItem = await prisma.asoebiitem.findUnique({
    where: {
      id: id,
    },
    include: {
      AsoebiItemCategory: {
        include: {
          category: true,
        },
      },
    },
  });

  await prisma.$disconnect();
  return asoebiItem;
};

const GetAll = async () => {
  const asoebiItems = await prisma.asoebiitem.findMany({
    // include: {
    //   AsoebiItemCategory: {
    //     include: {
    //       category: true, // Include the related category
    //     },
    //   },
    // },
  });
  await prisma.$disconnect();
  return asoebiItems;
};
const searchAsoebiItemsByCategorySlug = async (categorySlug) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        OR: [
          { slug: categorySlug },
          { subCategories: { some: { slug: categorySlug } } },
        ],
      },
      include: {
        AsoebiItemCategory: {
          include: {
            asoebiItem: true,
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
  let prisma = new PrismaClient();
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      
      result = await prisma.asoebiitem.create({
        data: {
          title: data.title,
          details: data.details,
          amount: parseFloat(data.amount),
          image: image,
          weight: parseFloat(data.weight),
          altImages: data.altImages || [],
          AsoebiItemCategory: data.categories && Array.isArray(data.categories) ? {
            create: data.categories.map((c) => ({ categoryId: parseInt(c) })),
          } : undefined,
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
  const asoebiItem = await prisma.asoebiitem.findUnique({
    where: {
      id: id,
    },
  });

  if (asoebiItem) {
    let Data = await prisma.asoebiitem.update({
      where: {
        id: id,
      },
      data: {
        image: image ? image : asoebiItem.image,
        amount: data.amount ? parseFloat(data.amount) : asoebiItem.amount,
        details: data.details ? data.details : asoebiItem.details,
        title: data.title ? data.title : asoebiItem.title,
        weight: data.weight ? parseFloat(data.weight) : asoebiItem.weight,
        altImages: data.altImages ? data.altImages : asoebiItem.altImages,
      },
    });
    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let asoebiItem = await prisma.asoebiitem.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return asoebiItem;
};

module.exports = {
  Create,
  Get,
  GetAll,
  Update,
  Delete,
  searchAsoebiItemsByCategorySlug,
};
