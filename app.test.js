const app = require('./app');
const request = require('supertest');
const { expectCt } = require('helmet');

describe("GET /", () => {

    describe("given a user is not logged in", () => {
        test("should respond with a 200 status code", async () => {
            const response = await request(app).get("/").send({})
        
            expect(response.statusCode).toBe(200);
        })
    })
})