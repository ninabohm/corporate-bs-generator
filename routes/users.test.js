const app = require('../app');
const request = require('supertest');

describe("POST /users/register", () => {
    // describe("given a first name, last name, email, and password", () => {
    //     test("should respond with a 200 status code", async () => {
    //         const response = await request(app).post("/users/register").send({
    //             firstName: "firstName",
    //             lastName: "lastName",
    //             email: "email",
    //             password: "password"
    //         })
    //         expect(response.statusCode).toBe(200)
    //     })
    // })
    // describe("given first name, last name, email, or password are missing", () => {
    //     test("should respond with a 400 status code", async () => {
    //         const response = await request(app).post("/users/register").send({
    //             firstName: "firstName"
    //         })
    //         expect(response.statusCode).toBe(400)
    //     })
    // })
    
})

describe("GET /users", () => {
    describe("given a user is not logged in", () => {
        test("should respond with a 302 status code and redirect to login", async () => {
            const response = await request(app).get("/users").send({})
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toContain('/login');
        })
    })
    
    
})

