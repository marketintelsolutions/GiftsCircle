const { PrismaClient } = require("@prisma/client");
const {
  hashPassword,
  comparePassword,
  GenerateToken,
  CreateDefaultPassword,
} = require("../../Utils/HelperFunctions");
const ResponseDTO = require("../../DTO/Response");
const prisma = new PrismaClient();

const Login = async (data) => {
  const admin = await prisma.admin.findFirst({
    where: {
      email: data.email,
    },
  });
  if (admin) {
    let checkPasssword = await comparePassword(data.password, admin.password);
    if (checkPasssword) {
      await prisma.$disconnect();
      if (admin.role === "SUPERADMIN") {
        let token = GenerateToken(data.email, admin.id, "SUPERADMIN", "4h");
        return { token, admin };
      } else {
        let token = GenerateToken(data.email, admin.id, "ADMIN", "4h");
        return { token, admin };
      }
    }

    return null;
  }
  return null;
};

const GetAdmin = async (id) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return admin;
};

const GetAdmins = async () => {
  const admins = await prisma.admin.findMany({
    where: {
      role: "ADMIN",
    },
  });

  await prisma.$disconnect();
  return admins;
};

const Create = async (data, image) => {
  const admin = await prisma.admin.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!admin) {
    const createdAdmin = await prisma.admin.create({
      data: {
        defaultPassword: CreateDefaultPassword(),
        password: "",
        email: data.email,
        lastname: data.lastname,
        firstname: data.firstname,
        role: "ADMIN",
        image: image,
      },
    });

    return createdAdmin;
  }
  return null;
};

const SetPassword = async (data, email) => {
  const admin = await prisma.admin.findUnique({
    where: {
      email: email,
    },
  });
  if (!admin) return ResponseDTO("Failed", "Admin not found");

  if (admin.defaultPassword !== data.defaultPassword)
    return ResponseDTO("Failed", "Incorrect default password");

  const hashedPassword = await hashPassword(data.password);
  await prisma.admin.update({
    where: {
      id: admin.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return ResponseDTO("Success", "Password set successfully");
};

const UpdateAdmin = async (data, id) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: id,
    },
  });

  if (admin) {
    let updatedAdmin = await prisma.admin.update({
      where: {
        id: id,
      },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        updated_at: new Date(Date.now()),
      },
    });

    return updatedAdmin;
  }

  return null;
};

const DeleteAdmin = async (id) => {
  let admin = await prisma.admin.delete({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return admin;
};

module.exports = {
  Login,
  Create,
  UpdateAdmin,
  DeleteAdmin,
  GetAdmin,
  GetAdmins,
  SetPassword,
};
