import { describe, it, vi, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import jwt from "jsonwebtoken"
import request from "supertest"

const Note = require('../models/note')
const User = require('../models/user')

describe("Note router", () => {
    let redisMock
    let mongoServer
    let app
    let config
    let noteID
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
        const noteRouter = require('../routers/note')(config, redisMock)
        app.use('/notes/', noteRouter)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await Note.deleteMany({})
        
        // Create a new Note
        const newNote = new Note({
            ownedBy: userID,
            title: 'Test123',
            content: 'Random content XD XD'
        })

        await newNote.save()

        const note = await Note.findOne({ title: 'Test123', ownedBy: userID }).select('_id')
        noteID = note._id.toString()
    })
    
    describe("GET /:id", () => {
        it("Details of note", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/notes/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)
            expect(res.body.title).toMatch(/Test123/)
            expect(res.body.content).toMatch(/Random content XD XD/)
        })
    
        it("Denied access to note without login", async () => {
            const res = await request(app)
                .get(`/notes/${noteID}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Denied access to another user's note", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')
    
            const res = await request(app)
                .get(`/notes/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    
        it("Note doesn't exist", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')
    
            const res = await request(app)
                .get(`/notes/111111111111111111111111`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(404)
        })
    })

    describe("POST /new", () => {
        const body = {
            title: 'New note',
            content: 'HAHAHA beka'
        }

        it("Create a new note", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .post('/notes/new/')
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(201)
        })
    })

    describe("PUT /edit", () => {
        it("Edit note", async () => {
            const body = {
                title: 'New note',
                content: 'HAHAHA beka'
            }
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .put(`/notes/edit/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/notes/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.body.title).toMatch("New note");
            expect(resOutput.body.content).toMatch("HAHAHA beka");
        })

        it("Unauthoized attempt to edit note", async () => {
            const body = {
                title: 'New note',
                content: 'HAHAHA beka'
            }
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .put(`/notes/edit/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(body)
            
            expect(res.statusCode).toBe(401)
        })
    })

    describe("DELETE /delete", () => {
        it("Delete note", async () => {
            const token = jwt.sign({ username: 'test', sessionID: '123' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('123')

            const res = await request(app)
                .delete(`/notes/delete/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(200)

            const resOutput = await request(app)
                .get(`/notes/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(resOutput.statusCode).toBe(404)
        })

        it("Unauthoized attempt to delete note", async () => {
            const token = jwt.sign({ username: 'anotherTest', sessionID: '1267' }, config.JWT_Secret)
            redisMock.get.mockResolvedValue('1267')

            const res = await request(app)
                .delete(`/notes/delete/${noteID}`)
                .set('Authorization', `Bearer ${token}`)
            
            expect(res.statusCode).toBe(401)
        })
    })
})