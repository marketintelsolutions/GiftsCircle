const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const GetAll = async () => {
  const categories = await prisma.category.findMany({
    include: {
      subCategories: true,
    },
  });
  await prisma.$disconnect();
  return categories;
};

const Create = async (data, user) => {
  let slug = generateSlug(data.name);

  const category = await prisma.category.findFirst({
    where: {
      slug: slug,
    },
  });

  if (category) {
    await prisma.$disconnect();
    return null;
  }
  if (data.parentCategoryId) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: slug,
        parentCategory: {
          connect: {
            id: data.parentCategoryId,
          },
        },
        created_by: user.id,
      },
    });
    await prisma.$disconnect();
    return category;
  }
  const Data = await prisma.category.create({
    data: {
      name: data.name,
      slug: slug,
    },
  });
  return Data;
};

const Delete = async (id) => {
  const res = await prisma.category.delete({
    where: {
      id: id,
    },
  });
  await prisma.$disconnect();
  return res;
};

function generateSlug(inputString) {
  const words = inputString.toLowerCase().split(/\s+/);

  const hyphenSeparatedString = words.join("-");

  return hyphenSeparatedString;
}
module.exports = { Create, GetAll, Delete };
