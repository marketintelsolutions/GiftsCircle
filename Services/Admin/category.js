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
            id: parseInt(data.parentCategoryId),
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
      created_by: user.id
    },
  });
  await prisma.$disconnect();
  return Data;
};

const Update = async (id, data) => {
  const category = await prisma.category.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (category) {
    let slug = generateSlug(data.name);
    let Data = await prisma.category.update({
      where: {
        id: parseInt(id),
      },
      data: {
       name: data.name,
       slug: slug
      },
    });

    await prisma.$disconnect();
    return Data;
  }
  return null;
};

const Delete = async (id) => {
  const res = await prisma.category.delete({
    where: {
      id: parseInt(id),
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
module.exports = { Create, GetAll, Update, Delete };
