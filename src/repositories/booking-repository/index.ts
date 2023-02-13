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
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId,
      updatedAt: new Date()
    }
  });
}

const bookingRepository = {
  getBooking,
  postBooking,
  updateBooking  
};

export default bookingRepository;
