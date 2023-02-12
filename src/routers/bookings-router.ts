import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
  .all("/*")
  .get("/")
  .post("/")
  .put("/:bookingId");

export { bookingsRouter };
