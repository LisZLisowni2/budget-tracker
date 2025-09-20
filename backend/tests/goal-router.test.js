import { describe, it, vi, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken"
import request from "supertest"

const Goal = require('../models/goal')
const User = require('../models/user')

describe("Goal router", () => {
    let redisMock
    let mongoServer
    let app
    let config
    let goalID
    let userID

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoURI = await mongoServer.getUri()

        await mongoose.connect(mongoURI)

        // Create app and configuration
        app = express()
        app.use(express.json())

        redisMock = {
            get: vi.fn(),
            setEx: vi.fn(),
            del: vi.fn()
        }
        
        config = {
            JWT_Secret: 'jwt_secret'
        }

        // Create example user
        const newUser = new User({
            username: 'test',
            email: 'abc124@gmail.example.com',
            password: '$2a$12$hrBDpflcFtPsoT6lfUONj.cdcg1AMpxQ20bz6V2cS.LXH8PZu8O5.',
            scope: 'user'
        })

        await newUser.save()

        // Create another example user
        const anotherUser = new User({
            username: 'anotherTest',
            email: 'abc@example.com',
            password: '$2a$12$hrBDpflcFtPsoT6lfUONj.cdcg1AMpxQ20bz6V2cS.LXH8PZu8O5.',
            scope: 'user'
        })

        await anotherUser.save()

        // Inject ID
        const user = await User.findOne({ username: 'test' }).select('_id')
        userID = user._id.toString()

        // Attach router to app
        const goalRouter = require('../routers/goal')(config, redisMock)
        app.use('/goals/', goalRouter)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await Goal.deleteMany({})
        
        // Create a new Goal
        const newGoal = new Goal({
            ownedBy: userID,
            goalname: "Kotek",
            requiredmoney: 8000
        })

        await newGoal.save()

        const goal = await Goal.findOne({ goalname: "Kotek", ownedBy: userID }).select('_id')
        goalID = goal._id.toString()
    })
    
    describe("GET /:id", () => {
        it("Details of goal", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/goals/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)
            expect(res.body.goalname).toMatch(/Kotek/)
            expect(res.body.requiredmoney).toBe(8000)
        })
    
        it("Denied access to goal without login", async () => {
            const res = await request(app)
                .get(`/goals/${goalID}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Denied access to another user's goal", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')
    
            const res = await request(app)
                .get(`/goals/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Goal doesn't exist", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/goals/111111111111111111111111`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(404)
        })
    })

    describe("GET /all", () => {
        it("All goals", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/goals/all`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)
            expect(res.body.length).toBe(1)
        })
    })

    describe("POST /new", () => {
        const body = {
            goalname: "Komputer",
            requiredmoney: 7500
        }

        it("Create a new goal", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .post('/goals/new/')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(201)
        })
    })

    describe("PUT /edit", () => {
        const body = {
            goalname: 'Harambe',
            requiredmoney: 4500
        }
        it("Edit goal", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .put(`/goals/edit/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/goals/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.body.goalname).toMatch("Harambe");
            expect(resOutput.body.requiredmoney).toBe(4500);
        })

        it("Unauthoized attempt to edit goal", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .put(`/goals/edit/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(401)
        })
    })

    describe("DELETE /delete", () => {
        it("Delete goal", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .delete(`/goals/delete/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/goals/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.statusCode).toBe(404)
        })

        it("Unauthoized attempt to delete goal", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .delete(`/goals/delete/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    })

    describe("PUT /complete", () => {
        it("Complete Goal", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .put(`/goals/complete/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/goals/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.body.goalname).toMatch("Harambe");
            expect(resOutput.body.requiredmoney).toBe(4500);
        })

        it("Unauthoized attempt to complete goal", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .put(`/goals/complete/${goalID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    })
})