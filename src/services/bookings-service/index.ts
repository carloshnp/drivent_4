import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);
  if(!userBooking) {
    throw new Error ("FORBIDDEN");
  }
  return userBooking;
}

async function postBooking(userId: number, roomId: number) {
  const booking = await bookingRepository.postBooking(roomId, userId);
  return booking;
}

const bookingService = {
  getBooking,
  postBooking
};

export default bookingService;
