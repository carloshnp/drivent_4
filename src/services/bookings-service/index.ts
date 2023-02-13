import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getBooking(userId: number) {
  const userBooking = await bookingRepository.getBooking(userId);
  if(!userBooking) {
    throw new Error ("NOT_FOUND");
  }
  return userBooking;
}

async function postBooking(userId: number, roomId: number) {
  await validateBooking(userId, roomId);
  const booking = await bookingRepository.postBooking(userId, roomId);
  return booking;
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await validateBooking(userId, roomId);
  const booking = await bookingRepository.getBooking(userId);
  if(!booking) {
    throw new Error ("FORBIDDEN");
  }
  const updatedBooking = await bookingRepository.updateBooking(roomId, bookingId);
  return updatedBooking;
}

async function validateBooking(userId: number, roomId: number) {
  const hasEnrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!hasEnrollment) {
    throw new Error ("FORBIDDEN");
  }
  const hasTicket = await ticketRepository.findTicketByEnrollmentId(hasEnrollment.id);
  if (!hasTicket || hasTicket.status === "RESERVED" || hasTicket.TicketType.isRemote || !hasTicket.TicketType.includesHotel) {
    throw new Error ("FORBIDDEN");
  }
  const hasEmptyRoom = await bookingRepository.getEmptyRoom(roomId);
  if (!hasEmptyRoom) {
    throw notFoundError();
  }
  if (hasEmptyRoom.capacity === hasEmptyRoom.Booking.length) {
    throw new Error ("FORBIDDEN");
  }
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking
};

export default bookingService;
