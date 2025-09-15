import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest"
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import authorization from "../utils/authorization"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
const User = require('../models/user')

describe("Auth middleware", () => {
    let app
    let redisMock
    let config
    let mongoServer

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const mongodbURI = await mongoServer.getUri()

        await mongoose.connect(mongodbURI)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await User.deleteMany({})

        redisMock = {
            get: vi.fn()
        }

        config = { 'JWT_Secret': 'test_secret' }
        const { authenticateToken, authorizedAccess } = authorization(config, redisMock)
        app = express()
        app.use(express.json())

        app.get("/protected", 
            authenticateToken,
            authorizedAccess('admin'),
            (req, res) => res.json({ ok: true })
        )
    })

    it("Should return 401 http Code", async () => {
        const res = await request(app).get('/protected')
        expect(res.status).toBe(401)
        expect(res.body.message).toMatch(/Token missing/)
    })

    it("Should return 403 http Code if token is invalid", async () => {
        const res = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid_token')
        expect(res.status).toBe(403)
        expect(res.body.message).toMatch(/Invalid token/)
    })

    it("Should return 401 http Code if missing in Redis", async () => {
        const token = jwt.sign({ sessionID: '123', username: 'testuser' }, config.JWT_Secret)
        redisMock.get.mockResolvedValue(null)

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`)
        
        expect(redisMock.get).toHaveBeenCalledWith('123')
        expect(res.statusCode).toBe(401)
        expect(res.body.message).toMatch(/Session expired or has invalided/)
    })

    it("Should allow access if token and session are valid and user has correct role", async () => {
        const newUser = new User({
            username: 'test',
            email: 'test@example.com',
            scope: 'admin'
        })
        await newUser.save()

        const token = jwt.sign({ sessionID: '123', username: 'test' }, config.JWT_Secret)
        redisMock.get.mockResolvedValue('some-session')

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.statusCode).toBe(200)
        expect(res.body.ok).toBe(true)
    })

    it('should reject access if user does not exist', async () => {
        const newUser = new User({
            username: 'test123',
            email: 'test@example.com',
            scope: 'admin'
        })
        await newUser.save()

        const token = jwt.sign({ sessionID: '123', username: 'test' }, config.JWT_Secret)
        redisMock.get.mockResolvedValue('some-session')

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.statusCode).toBe(404)
        expect(res.body.message).toMatch(/User not found/);
    })

    it('should reject access if user does not have required role', async () => {
        const newUser = new User({
            username: 'test',
            email: 'test@example.com',
            scope: 'user'
        })
        await newUser.save()

        const token = jwt.sign({ sessionID: '123', username: 'test' }, config.JWT_Secret)
        redisMock.get.mockResolvedValue('some-session')

        const res = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`)
        
        expect(res.statusCode).toBe(403)
        expect(res.body.message).toMatch(/Access denied/);
    })
})