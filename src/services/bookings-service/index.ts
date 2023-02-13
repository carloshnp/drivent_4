import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);
  if(!userBooking) {
    throw new Error ("FORBIDDEN");
  }
  return userBooking;
}

async function postBooking(userId: number, roomId: number) {
  const booking = await bookingRepository.postBooking(userId, roomId);
  return booking;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  const booking = await bookingRepository.getBooking(userId);
  if(!booking) {
    throw new Error ("FORBIDDEN");
  }
  const updatedBooking = await bookingRepository.updateBooking(roomId, bookingId);
  return updatedBooking;
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking
};

export default bookingService;
