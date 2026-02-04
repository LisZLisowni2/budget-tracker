const express = require("express");
const User = require("../models/user");
const Note = require("../models/note");
const authorization = require("../utils/authorization");

const router = express.Router();

module.exports = (config, redis) => {
    const Auth = authorization(config, redis);

    /**
     * @swagger
     * /api/notes/:
     *   get:
     *     summary: List of notes
     *     tags:
     *       - Note
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: List of notes for user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 notes:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       _id:
     *                         type: string
     *                         example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                       title:
     *                         type: string
     *                         example: Note 1
     *                       content:
     *                         type: string
     *                         example: Note description
     *                       createdAt:
     *                         type: string
     *                         example: 2020-01-01T00:00:00.000Z
     *                       updatedAt:
     *                         type: string
     *                         example: 2020-01-01T00:00:00.000Z
     *                       ownedBy:
     *                         type: string
     *                         example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.get("/all", Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user;
            const user = await User.findOne({ username: username }).select(
                "_id",
            );

            if (await redis.get(`ALL-NOTES-${user._id.toString()}`)) {
                const notes = await redis.get(
                    `ALL-NOTES-${user._id.toString()}`,
                );
                return res.status(200).json(JSON.parse(notes));
            }

            const notes = await Note.find({ ownedBy: user._id });
            await redis.setEx(
                `ALL-NOTES-${user._id.toString()}`,
                60 * 60,
                JSON.stringify(notes),
            );

            res.status(200).json(notes);
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * @swagger
     * /api/notes/{id}:
     *   get:
     *     summary: Get note by ID
     *     tags:
     *       - Note
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Note by ID of user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 _id:
     *                   type: string
     *                   example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *                 title:
     *                   type: string
     *                   example: Note 1
     *                 content:
     *                   type: string
     *                   example: Note description
     *                 createdAt:
     *                   type: string
     *                   example: 2020-01-01T00:00:00.000Z
     *                 updatedAt:
     *                   type: string
     *                   example: 2020-01-01T00:00:00.000Z
     *                 ownedBy:
     *                   type: string
     *                   example: 5f1f1f1f1f1f1f1f1f1f1f1f
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       404:
     *         description: Note not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note not found
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.get("/:id", Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id;
            const note = await Note.findOne({ _id: noteID });

            if (!note)
                return res.status(404).json({ message: "Note doesn't exist" });

            // Verify user ownership
            const { username } = req.user;
            const user = await User.findOne({ username: username }).select(
                "_id",
            );
            if (note.ownedBy.toString() !== user._id.toString())
                return res.status(401).json({ message: "Unauthorized access" });

            res.status(200).json(note);
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * @swagger
     * /api/notes/new/:
     *   post:
     *     summary: Create new note
     *     tags:
     *       - Note
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Note 1
     *               content:
     *                 type: string
     *                 example: Note description
     *     responses:
     *       201:
     *         description: New note created
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note created
     *       400:
     *         description: Bad request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Bad request
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.post("/new", Auth.authenticateToken, async (req, res) => {
        try {
            const { title, content } = req.body;

            if (title === undefined || content === undefined)
                return res
                    .status(404)
                    .json({
                        message:
                            "Title or content doesn't exist in request body",
                    });

            // Fetch user ID
            const { username } = req.user;
            const user = await User.findOne({ username: username }).select(
                "_id",
            );
            const userID = user._id;

            const newNote = new Note({
                title: title,
                ownedBy: userID,
                content: content,
            });

            await newNote.save();
            await redis.del(`ALL-NOTES-${user._id.toString()}`);

            res.status(201).json({ message: "Note created" });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * @swagger
     * /api/notes/edit/{id}:
     *   put:
     *     summary: Edit note
     *     tags:
     *       - Note
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: Note 1
     *               content:
     *                 type: string
     *                 example: Note description
     *     responses:
     *       200:
     *         description: Note updated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note updated
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       404:
     *         description: Note doesn't exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note doesn't exist
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.put("/edit/:id", Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id;

            // Verify user ownership
            const { username } = req.user;
            const note = await Note.findOne({ _id: noteID });
            if (!note)
                return res.status(404).json({ message: "Note doesn't exist" });

            const user = await User.findOne({ username: username }).select(
                "_id",
            );
            if (note.ownedBy.toString() !== user._id.toString())
                return res.status(401).json({ message: "Unauthorized access" });

            await Note.findOneAndUpdate({ _id: noteID }, req.body);
            await Note.findOneAndUpdate(
                { _id: noteID },
                { updatedAt: Date.now() },
            );
            await redis.del(`ALL-NOTES-${user._id.toString()}`);

            res.status(200).json({ message: "Note edited" });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * @swagger
     * /api/notes/delete/{id}:
     *   delete:
     *     summary: Edit note
     *     tags:
     *       - Note
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *       - in: query
     *         name: id
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Note deleted
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note deleted
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Unauthorized
     *       404:
     *         description: Note doesn't exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Note doesn't exist
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Internal server error
     */
    router.delete("/delete/:id", Auth.authenticateToken, async (req, res) => {
        try {
            const noteID = req.params.id;

            // Verify user ownership
            const { username } = req.user;
            const note = await Note.findOne({ _id: noteID });
            if (!note)
                return res.status(404).json({ message: "Note doesn't exist" });

            const user = await User.findOne({ username: username }).select(
                "_id",
            );
            if (note.ownedBy.toString() !== user._id.toString())
                return res.status(401).json({ message: "Unauthorized access" });

            await Note.findOneAndDelete({ _id: noteID });
            await redis.del(`ALL-NOTES-${user._id.toString()}`);

            res.status(200).json({ message: "Note deleted" });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    return router;
};
