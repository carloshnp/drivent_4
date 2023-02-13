import bookingRepository from "@/repositories/booking-repository";

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);
  if(!userBooking) {
    throw new Error ("FORBIDDEN");
  }
  return userBooking;
}

const bookingService = {
  getBooking
};

export default bookingService;
