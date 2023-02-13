import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getBookings } from "@/controllers";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getBookings)
  .post("/")
  .put("/:bookingId");

export { bookingsRouter };
