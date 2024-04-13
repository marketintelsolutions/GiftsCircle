const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require("axios");

const GetLocationData = async () => {
  const data = await prisma.sms.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
  await prisma.$disconnect();
  return data;
};

const CreateLocation = async (data) => {
  const coordinates = data.Body.split(",");

  let Data = await prisma.sms.create({
    data: {
      latitude: coordinates[1],
      longitude: coordinates[0],
      sender: data.From,
    },
  });
  await prisma.$disconnect();

  return Data;
};

const CreateLocation2 = async (data) => {
  let Data = await prisma.sms.create({
    data: {
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString(),
      sender: "08132030908",
    },
  });

  const formBody = {
    to: "2348132030908",
    message: `www.google.com/maps/dir/${data.latitude},${data.longitude}/`,
    sender_name: "Sendchamp",
    route: "dnd",
  };

  SendSms(formBody);
  await prisma.$disconnect();

  return Data;
};

const Delete = async (id) => {
  const data = await prisma.sms.delete({
    where: {
      id: id,
    },
  });
  await prisma.$disconnect();
  return data;
};

const SendSms = (data) => {
  const axiosConfig = {
    method: "post",
    url: "https://api.sendchamp.com/api/v1/sms/send",
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SEND_CHAMP_TOKEN}`,
    },
    data: data,
  };

  axios(axiosConfig)
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

module.exports = {
  CreateLocation,
  GetLocationData,
  CreateLocation2,
  Delete,
};
