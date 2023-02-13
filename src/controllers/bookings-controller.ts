import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const booking = await bookingService.getBooking(userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = req.body.roomId;
  try {
    const booking = await bookingService.postBooking(userId, parseInt(roomId));
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function updateBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const { bookingId } = req.params;
  try {
    const updatedBooking = bookingService.updateBooking(userId, roomId, parseInt(bookingId));
    return res.status(httpStatus.OK).send(updatedBooking);
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
