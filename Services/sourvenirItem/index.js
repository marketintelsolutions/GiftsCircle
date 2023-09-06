const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const prisma = new PrismaClient();

const Get = async (id) => {
  const sourvenirItem = await prisma.sourvenirItem.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return sourvenirItem;
};

const GetAll = async () => {
  const sourvenirItems = await prisma.sourvenirItem.findMany({
    // include: {
    //   SourvenirItemCategory: {
    //     include: {
    //       category: true, // Include the related category
    //     },
    //   },
    // },
  });
  await prisma.$disconnect();
  return sourvenirItems;
};

const searchSouvernirItemsByCategorySlug = async (categorySlug) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        OR: [
          { slug: categorySlug },
          { subCategories: { some: { slug: categorySlug } } },
        ],
      },
      include: {
        SourvenirItemCategory: {
          include: {
            sovernirItem: true,
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
      result = await prisma.sourvenirItem.create({
        data: {
          title: data.title,
          category: data.category,
          details: data.details,
          amount: parseInt(data.amount),
          image: image,
          weight: parseInt(data.weight),
          SourvenirItemCategory: {
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
  const sourvenirItem = await prisma.sourvenirItem.findUnique({
    where: {
      id: id,
    },
  });

  if (sourvenirItem) {
    let Data = await prisma.sourvenirItem.update({
      where: {
        id: id,
      },
      data: {
        image: image ? image : sourvenirItem.image,
        amount: data.amount ? parseInt(data.amount) : sourvenirItem.amount,
        details: data.details ? data.details : sourvenirItem.details,
        category: data.category ? data.category : sourvenirItem.category,
        title: data.title ? data.title : sourvenirItem.title,
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  let sourvenirItem = await prisma.sourvenirItem.delete({
    where: {
      id: id,
    },
  });
  await prisma.$disconnect();
  return sourvenirItem;
};

module.exports = {
  Create,
  Get,
  GetAll,
  Update,
  Delete,
  searchSouvernirItemsByCategorySlug,
};
