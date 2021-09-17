const app = require('../app');
const request = require('supertest');
jest.mock('./passport-config');

describe("GET /login", () => {

    describe("given a user is not logged in", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/login").send({})
            expect(response.statusCode).toBe(200);
        })
    })
    describe("given a user is logged in", () => {
        test("should respond with a 302 status code and redirect to /users/account", async () => {
             
            const response = await request(app).get("/login").send({
                //mock user 
            })
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toContain("/users/account");
        })
    })
    
})