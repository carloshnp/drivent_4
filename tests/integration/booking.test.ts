import app, { init } from "@/app";
import { createBooking, createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketTypeRemote, createTicketTypeWithHotel, createTicketTypeWithoutHotel, createUser } from "../factories";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import * as jwt from "jsonwebtoken";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /booking", () => {
  it("should respond with status 401 if no token", async () => {
    const res = await server.post("/booking");
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is invalid", async () => {
    const token = faker.lorem.word();
    const res = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if no session", async () => {
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    const res = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if no body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const res = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
    
    it("should respond with status 400 if body is invalid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const body = { [faker.lorem.word()]: faker.lorem.word() };
      const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
    
    describe("when body is valid", () => {
      it("should respond with status 403 if no enrollment", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket is remote", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket doesn't include hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket isn't paid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if room is full", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.FORBIDDEN);
      });

      it("should respond with status 404 if room doesn't exist", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id+1000 };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.NOT_FOUND);
      });

      it("should respond with status 200 when booking is valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const payment = await createPayment(ticket.id, ticketType.price);
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
        const body = { roomId: room.id };
        const res = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
        expect(res.status).toBe(httpStatus.OK);
        expect(res.body).toEqual({
          bookingId: expect.any(Number)
        });
      });
    });
  });
});

describe("GET /booking", () => {
  it("should respond with status 401 if no token", async () => {
    const res = await server.get("/booking");
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is invalid", async () => {
    const token = faker.lorem.word();
    const res = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if no session", async () => {
    const user = await createUser();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    const res = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const res = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 when booking is valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const res = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toEqual({
        id: expect.any(Number),
        Room: {
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });
    });
  });
});

describe("PUT /booking", () => {
  describe("when token is valid", () => {
    it("should respond with status 200 when booking is valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const updatedRoom = await createRoomWithHotelId(hotel.id);
      const body = { roomId: updatedRoom.id };
      const res = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toEqual({
        bookingId: expect.any(Number)
      });
    });
  });
});
