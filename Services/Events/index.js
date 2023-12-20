const { PrismaClient } = require("@prisma/client");
const {
  CreateEventId,
  CreateCoHostId,
  CreateGuestId,
} = require("../../Utils/HelperFunctions");
const prisma = new PrismaClient();
const ResponseDTO = require("../../DTO/Response");
const { SendEventPublishedEmail } = require("../../Utils/Email/EmailService");

const GetEvent = async (id) => {
  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });

  await prisma.$disconnect();
  return event;
};

const GetUserEvents = async (id) => {
  const events = await prisma.event.findMany({
    where: {
      userId: id,
    },
    include: {
      gift: {
        select: {
          giftitemId: true,
        },
      },
    },
  });

  const guestEvents = await prisma.guests.findMany({
    where: {
      userId: id,
    },
    select: {
      event: {
        select: {
          id: true,
          title: true,
          summary: true,
          descSummary: true,
          date: true,
          venue: true,
          timezone: true,
          start_time: true,
          end_time: true,
          image: true,
          userId: true,
          host: true,
          applyDonation: true,
          published: true,
          percentDonation: true,
          guestCode: true,
          coHostCode: true,
          created_at: true,
          gift: {
            select: {
              giftitemId: true,
            },
          },
        },
      },
    },
  });

  const selectedEvents = [];
  guestEvents.map((ele) => selectedEvents.push(ele.event));
  const data = [...selectedEvents, ...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  await prisma.$disconnect();
  return data;
};

const GetCoHostGuestCode = async (eventId, userId) => {
  const code = await prisma.coHostCodes.findFirst({
    where: {
      eventId: eventId,
      userId: userId,
    },
  });

  await prisma.$disconnect();
  return code;
};

const Create = async (data, userId) => {
  const coHostId = data.coHost ? CreateCoHostId() : "";
  const guestCode = CreateGuestId();
  let event = await prisma.event.create({
    data: {
      id: CreateEventId(),
      title: data.title,
      category: data.category,
      venue: data.venue,
      date: new Date(data.date),
      start_time: data.start_time,
      end_time: data.end_time,
      timezone: data.timezone,
      host: data.host,
      userId: userId,
      co_hosts: undefined,
      published: false,
      applyDonation: false,
      coHostCode: coHostId,
      coHostLink: "",
      guestCode: guestCode,
      eventLink: "",
      percentDonation: 0,
    },
  });

  await prisma.coHostCodes.create({
    data: {
      userId: userId,
      eventId: event.id,
      code: guestCode,
    },
  });

  await prisma.$disconnect();
  return event;
};

const Update1 = async (data) => {
  const event = await prisma.event.findUnique({
    where: {
      id: data.id,
    },
  });

  if (event) {
    let updatedEvent = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        category: data.category,
        venue: data.venue,
        date: new Date(data.date),
        start_time: data.start_time,
        end_time: data.end_time,
        timezone: data.timezone,
        host: data.host,
        updated_by: event.userId,
      },
    });

    await prisma.$disconnect();
    return updatedEvent;
  }
  return null;
};

const Update2 = async (data, image) => {
  const event = await prisma.event.findUnique({
    where: {
      id: data.id,
    },
  });

  if (event) {
    let res = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        image: image,
        descSummary: data.desc_summary,
        summary: data.summary,
      },
    });

    await prisma.$disconnect();
    return res;
  }
  return null;
};

const Update3 = async (data) => {
  const event = await prisma.event.findUnique({
    where: {
      id: data.id,
    },
  });
  const user = await prisma.user.findUnique({
    where: {
      id: event.userId,
    },
  });

  if (event) {
    let Data = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        published: data.published,
        percentDonation: data.percentDonation,
        applyDonation: data.applyDonation,
      },
    });
    if (data.published) {
      const message = `Event: ${event.title} is published`;
      const notification = await prisma.notifications.create({
        data: {
          userId: event.userId,
          type: "EVENTCREATION",
          message: message,
          referenceEvent: event.id,
        },
      });
      await SendEventPublishedEmail(user.firstname, user.email, event);
      return { Data, notification };
    }
    const message = `Event: ${event.title} was edited`;
    const notification = await prisma.notifications.create({
      data: {
        userId: event.userId,
        type: "EVENTEDIT",
        message: message,
        referenceEvent: event.id,
      },
    });
    await prisma.$disconnect();
    return { Data, notification };
  }
  return null;
};

const DeleteEvent = async (id) => {
  let event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });
  await prisma.event.delete({
    where: {
      id: id,
    },
  });
  const message = `Event: ${event.title} deleted`;
  const notification = await prisma.notifications.create({
    data: {
      userId: event.userId,
      type: "EVENTDELETION",
      message: message,
      referenceEvent: event.id,
    },
  });

  await prisma.$disconnect();
  return { notification };
};

const AddGuest = async (data) => {
  const guest = await prisma.guests.findFirst({
    where: {
      eventId: data.eventId,
      userId: data.userId,
      coHost: false,
    },
  });

  if (guest) {
    if (guest.coHost === true) {
      return ResponseDTO("Failed", "Event CoHost can't join as Guest");
    }
    return ResponseDTO("Success", guest);
  }

  const event = await prisma.event.findUnique({
    where: {
      id: data.eventId,
    },
  });

  const cohostCode = await prisma.coHostCodes.findFirst({
    where: {
      eventId: event.id,
      code: data.guestCode,
    },
  });
  if (!cohostCode) return ResponseDTO("Failed", "Invalid CoHost Code");

  if (event) {
    if (cohostCode || data.guestCode === event.guestCode) {
      if (data.userId !== event.userId) {
        let Data = await prisma.guests.create({
          data: {
            event: {
              connect: {
                id: data.eventId,
              },
            },
            user: {
              connect: {
                id: data.userId,
              },
            },
            coHost: false,
            coHostId: cohostCode.userId,
          },
        });

        const message = `Event: A new guest joined ${event.title} event`;
        const notification = await prisma.notifications.create({
          data: {
            userId: event.userId,
            type: "GUESTJOIN",
            message: message,
            referenceEvent: event.id,
          },
        });

        await prisma.$disconnect();
        return ResponseDTO("Success", { Data, notification });
      } else {
        return ResponseDTO("Failed", "Event Owner can't join as Guest");
      }
    } else {
      return ResponseDTO("Failed", "Incorrect Guest Code");
    }
  } else {
    return ResponseDTO("Failed", "Event not found");
  }
};

const AddCoHost = async (data) => {
  let prisma = new PrismaClient();
  let transaction;
  let result;
  try {
    transaction = await prisma.$transaction(async (prisma) => {
      const cohost = await prisma.guests.findFirst({
        where: {
          eventId: data.eventId,
          userId: data.userId,
          coHost: true,
        },
      });

      if (cohost) {
        result = ResponseDTO("Success", cohost);
      } else {
        const event = await prisma.event.findUnique({
          where: {
            id: data.eventId,
          },
        });

        if (event) {
          if (event.coHostCode === data.coHostCode) {
            if (data.userId !== event.userId) {
              let Data = await prisma.guests.create({
                data: {
                  event: {
                    connect: {
                      id: data.eventId,
                    },
                  },
                  user: {
                    connect: {
                      id: data.userId,
                    },
                  },
                  coHost: true,
                },
              });
              await prisma.coHostCodes.create({
                data: {
                  userId: data.userId,
                  eventId: event.id,
                  code: CreateGuestId(),
                },
              });

              const message = `Event: Your Co Host joined ${event.title} event`;
              const notification = await prisma.notifications.create({
                data: {
                  userId: event.userId,
                  type: "COHOSTJOIN",
                  message: message,
                  referenceEvent: event.id,
                },
              });

              result = ResponseDTO("Success", { Data, notification });
            } else {
              result = ResponseDTO(
                "Failed",
                "Event Owner can't join as CoHost"
              );
            }
          } else {
            result = ResponseDTO("Failed", "Incorrect CoHost Code");
          }
        } else {
          result = ResponseDTO("Failed", "Event not found");
        }
      }
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

const GetGuestDetails = async (id, eventId) => {
  const guest = await prisma.guests.findFirst({
    where: {
      userId: id,
      eventId: eventId,
    },
  });

  return guest;
};

const GetEventGuests = async (id) => {
  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });

  if (event) {
    const data = await prisma.guests.findMany({
      where: {
        eventId: id,
        coHost: false,
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
    return data;
  } else {
    return null;
  }
};

const GetEventCoHosts = async (id) => {
  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });

  if (event) {
    const data = await prisma.guests.findMany({
      where: {
        eventId: id,
        coHost: true,
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
    return data;
  } else {
    return null;
  }
};

const GetCoHostGuests = async (id, coHostId) => {
  const event = await prisma.event.findUnique({
    where: {
      id: id,
    },
  });

  if (event) {
    const data = await prisma.guests.findMany({
      where: {
        eventId: id,
        coHostId: coHostId,
      },
      include: {
        user: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
    return data;
  } else {
    return null;
  }
};

module.exports = {
  Create,
  Update1,
  Update2,
  Update3,
  GetEvent,
  GetUserEvents,
  DeleteEvent,
  AddGuest,
  GetEventGuests,
  AddCoHost,
  GetEventCoHosts,
  GetCoHostGuestCode,
  GetGuestDetails,
  GetCoHostGuests,
};
