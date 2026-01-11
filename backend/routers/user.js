const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (config, redis) => {
    const Auth = require("../utils/authorization")(config, redis);

    function generateSessionID() {
        return new Promise((resolve, reject) => {
            try {
                const sessionID =
                    Date.now() + Math.random().toString(36).substring(2);
                resolve(sessionID);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * @swagger
     * /api/users/login:
     *   post:
     *     summary: Login user
     *     tags:
     *       - User
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 example: johndoe
     *               password:
     *                 type: string
     *                 format: password
     *                 example: mySecurePassword123
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Login successful
     *                 token:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *       400:
     *         description: Username or password not present
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Username or password not present
     *       401:
     *         description: Wrong password
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Wrong password
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User not found
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
    router.post("/login", async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password)
                return res
                    .status(400)
                    .json({ message: "Username or password not present" });

            const user = await User.findOne({ username: username }).select(
                "password"
            );
            if (!user)
                return res.status(404).json({ message: "User not found" });

            const passTest = await bcrypt.compare(password, user.password);
            if (!passTest)
                return res.status(401).json({ message: "Wrong password" });

            const sessionID = await generateSessionID();
            await redis.setEx(sessionID, 60 * 60, username);
            await User.findOneAndUpdate(
                { username: username },
                { lastLogin: new Date() }
            );
            const token = jwt.sign(
                { username: username, sessionID: sessionID },
                config.JWT_Secret,
                { expiresIn: "1h" }
            );
            res.json({ message: "Login successful", token });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

        /**
     * @swagger
     * /api/users/register:
     *   post:
     *     summary: Register user
     *     tags:
     *       - User
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 example: johndoe
     *               email:
     *                 type: string
     *                 example: foo@example.com
     *               password:
     *                 type: string
     *                 format: password
     *                 example: mySecurePassword123
     *     responses:
     *       201:
     *         description: Reigster successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Account created
     *       404:
     *         description: Username, email or password not present
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Username, email or password not present
     *       400:
     *         description: User with that username or email exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User with that username exist
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
    router.post("/register", async (req, res) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                res.status(404).json({
                    message: "Username, email or password not present",
                });
            }

            const user = await User.findOne({ username: username });
            if (user)
                return res
                    .status(400)
                    .json({ message: "User with that username exist" });

            const userByEmail = await User.findOne({ email: email });
            if (userByEmail)
                return res
                    .status(400)
                    .json({ message: "User with that email exist" });

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username: username,
                email: email,
                password: hashedPassword,
            });
            await newUser.save();
            res.status(201).json({ message: "Account created" });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

      /**
     * @swagger
     * /api/users/updatePassword:
     *   put:
     *     summary: Update user's password
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     tags:
     *       - User
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - password
     *             properties:
     *               password:
     *                  type: string
     *                  format: password
     *                  example: mySecurePassword123
     *     responses:
     *       200:
     *         description: Password update successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Account created
     *       400:
     *         description: User with that username or email exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User with that username exist
     *       401:
     *         description: Unauthorized access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Token missing, access denied
     *       403:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid token
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
    router.put("/updatePassword", Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user;

            const { password } = req.body;
            if (!password)
                return res
                    .status(400)
                    .json({ message: "Password not present" });

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findOneAndUpdate(
                { username: username },
                { password: hashedPassword }
            );
            res.json({ message: "Password updated" });
        } catch (err) {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error " });
        }
    });
      /**
     * @swagger
     * /api/users/update:
     *   put:
     *     summary: Update user
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     tags:
     *       - User
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             optional:
     *               - username
     *               - email
     *               - phone
     *               - baseCurrency
     *               - preferredLanguage
     *             properties:
     *               username:
     *                  type: string
     *                  example: joe
     *               email:
     *                  type: string
     *                  example: joe@example.com
     *               phone:
     *                  type: string
     *                  example: 1234567890
     *               baseCurrency:
     *                  type: string
     *                  example: USD
     *               preferredLanguage:
     *                  type: string
     *                  example: en
     *     responses:
     *       200:
     *         description: Update successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Update successful
     *       400:
     *         description: Wrong request
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User with that username exist
     *       401:
     *         description: Unauthorized access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Token missing, access denied
     *       403:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid token
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
    router.put("/update", Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user;

            if (req.body.scope)
                return res
                    .status(401)
                    .json({ message: "Your scope cannot be updated" });
            
            if (req.body.isVerified)
                return res
                    .status(401)
                    .json({ message: "Your isVerified cannot be updated" });

            if (req.body.password)
                return res
                    .status(400)
                    .json({
                        message:
                            "Password cannot be updated. Use /updatePassword instead",
                    });
            if (req.body.email) {
                const userByEmail = await User.findOne({
                    email: req.body.email,
                });
                if (userByEmail)
                    return res
                        .status(400)
                        .json({ message: "User with that email exist" });
            }
            if (req.body.username) {
                const userByUsername = await User.findOne({
                    username: req.body.username,
                });
                if (userByUsername)
                    return res
                        .status(400)
                        .json({ message: "User with that username exist" });
            }

            await User.findOneAndUpdate({ username: username }, req.body);
            res.json({ message: "Account updated" });
        } catch {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error " });
        }
    });

          /**
     * @swagger
     * /api/users/delete:
     *   delete:
     *     summary: Delete user
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     tags:
     *       - User
     *     responses:
     *       200:
     *         description: Password update successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Delete successful
     *       400:
     *         description: User with that username or email exist
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: User with that username exist
     *       401:
     *         description: Unauthorized access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Token missing, access denied
     *       403:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid token
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
    router.delete("/delete", Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user;
            await User.findOneAndDelete({ username: username });
            res.json({ message: "Account deleted" });
        } catch {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error " });
        }
    });

          /**
     * @swagger
     * /api/users/me:
     *   get:
     *     summary: Retrieve user data
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     tags:
     *       - User
     *     responses:
     *       200:
     *         description: Retrieve user data
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Data retrieved
     *       401:
     *         description: Unauthorized access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Token missing, access denied
     *       403:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid token
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
    router.get("/me", Auth.authenticateToken, async (req, res) => {
        try {
            const { username } = req.user;
            const userData = await User.findOne({ username: username }).select(
                "-v -_id -password"
            );
            res.json(userData);
        } catch {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error" });
        }
    });

    /**
     * @swagger
     * /api/users/logout:
     *   get:
     *     summary: Logout user
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         type: string
     *     tags:
     *       - User
     *     responses:
     *       200:
     *         description: Logout user
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Logout successful
     *       401:
     *         description: Unauthorized access
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Token missing, access denied
     *       403:
     *         description: Invalid token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Invalid token
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
    router.get("/logout", Auth.authenticateToken, async (req, res) => {
        try {
            await redis.del(req.user.sessionID);
            res.json({ message: "Logout successful" });
        } catch {
            if (config.NODE_ENV !== "production") console.error(err);
            res.status(500).json({ message: "Internal server error " });
        }
    });

    return router;
};
