import { prisma } from "@/config";

async function getBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId
    },
    select: {
      id: true,
      Room: true
    }
  });
}

async function postBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    }
  });
}

async function updateBooking(roomId: number, bookingId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId,
      updatedAt: new Date()
    }
  });
}

async function getEmptyRoom(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId
    },
    include: {
      Booking: true
    }
  });
}

const bookingRepository = {
  getBooking,
  postBooking,
  updateBooking,
  getEmptyRoom
};

export default bookingRepository;
