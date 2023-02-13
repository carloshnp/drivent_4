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
      roomId,
      userId
    }
  });
}

const bookingRepository = {
  getBooking,
  postBooking
};

export default bookingRepository;
