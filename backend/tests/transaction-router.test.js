import { describe, it, vi, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken"
import request from "supertest"

const Transaction = require('../models/transaction')
const User = require('../models/user')

describe("Transaction router", () => {
    let redisMock
    let mongoServer
    let app
    let config
    let transactionID
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
        const transactionRouter = require('../routers/transaction')(config, redisMock)
        app.use('/transactions/', transactionRouter)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await Transaction.deleteMany({})
        
        // Create a new Transaction
        const newTransaction = new Transaction({
            ownedBy: userID,
            name: "Test",
            price: 34.99,
            receiver: false
        })

        await newTransaction.save()

        const transaction = await Transaction.findOne({ name: 'Test', ownedBy: userID }).select('_id')
        transactionID = transaction._id.toString()
    })
    
    describe("GET /:id", () => {
        it("Details of transaction", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/transactions/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)
            expect(res.body.name).toMatch(/Test/)
            expect(res.body.price).toBe(34.99)
        })
    
        it("Denied access to transaction without login", async () => {
            const res = await request(app)
                .get(`/transactions/${transactionID}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Denied access to another user's transaction", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')
    
            const res = await request(app)
                .get(`/transactions/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Transaction doesn't exist", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/transactions/111111111111111111111111`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(404)
        })
    })

    describe("GET /all", () => {
        it("All transactions", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/transactions/all`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)
            expect(res.body.length).toBe(1)
        })
    })

    describe("POST /new", () => {
        const body = {
            name: "Wypłata",
            price: 4299.99,
            receiver: true
        }

        it("Create a new transaction", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .post('/transactions/new/')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(201)
        })
    })

    describe("PUT /edit", () => {
        const body = {
            name: "Zakupy",
            price: 49.99
        }
        it("Edit transaction", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .put(`/transactions/edit/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/transactions/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.body.name).toMatch("Zakupy");
            expect(resOutput.body.price).toBe(49.99);
        })

        it("Unauthoized attempt to edit transaction", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .put(`/transactions/edit/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(401)
        })
    })

    describe("DELETE /delete", () => {
        it("Delete transaction", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .delete(`/transactions/delete/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/transactions/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.statusCode).toBe(404)
        })

        it("Unauthoized attempt to delete transaction", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .delete(`/transactions/delete/${transactionID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    })
})