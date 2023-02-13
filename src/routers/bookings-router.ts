import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBookings, postBookings, updateBookings } from "@/controllers";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/", postBookings)
  .put("/:bookingId", updateBookings);

export { bookingsRouter };
