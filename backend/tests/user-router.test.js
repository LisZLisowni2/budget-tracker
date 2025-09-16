import { describe, it, vi, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken"
import request from "supertest"

const User = require('../models/user')

describe("User router", () => {
    let redisMock
    let mongoServer
    let app
    let config

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongoURI = await mongoServer.getUri()

        await mongoose.connect(mongoURI)

        // Create app and configuration
        app = express()
        app.use(express.json())

        redisMock = {
            get: vi.fn()
        }
        
        config = {
            JWT_Secret: 'jwt_secret'
        }

        // Attach router to app
        const userRouter = require('../routers/user')(config, redisMock)
        app.use('/users/', userRouter)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await User.deleteMany({})

        // Create example user
        const newUser = new User({
            username: 'test',
            email: 'abc123',
            scope: 'user'
        })

        await newUser.save()
    })

    it("Details of user", async () => {
        const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
        redisMock.get.mockResolvedValue('some-session')

        const res = await request(app)
            .get('/users/me')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.statusCode).toBe(200)
        expect(res.body).toStrictEqual({"__v": 0, "email": "abc123", "scope": "user", "username": "test"})
    })

    it("Denied to access details of user", async () => {
        const res = await request(app)
            .get('/users/me')
        
        expect(res.statusCode).toBe(401)
    })

    it("Register new user", async () => {
        const body = {
            username: 'test123',
            email: 'test@example.com',
            password: 'abc123'
        }
        
        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(body)

        expect(res.statusCode).toBe(201)
    })

    it("Register without required fields", async () => {
        const body = {
            username: 'test123',
            password: 'abc123'
        }
        
        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(body)

        expect(res.statusCode).toBe(400)
    })

    it("Login", async () => {
        const body = {
            username: 'test123',
            password: 'abc123'
        }
        
        const res = await request(app)
            .post('/users/register')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .send(body)

        expect(res.statusCode).toBe(400)
    })
})