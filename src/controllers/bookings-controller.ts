import { AuthenticatedRequest } from "@/middlewares";
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
  const { roomId } = req.body;
  try {
    const booking = await bookingService.postBooking(userId, roomId);
    return res.status(httpStatus.OK).send(booking);
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}