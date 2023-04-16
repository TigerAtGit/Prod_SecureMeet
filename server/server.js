const app = require('express')();
const server = require('http').createServer(app);
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User.js');
const Jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { body, validationResult } = require('express-validator');

const sendOtp = require('./controllers/mailController.js');

dotenv.config();
let socketList = {};
let blockedIPs = {}; // Temporary storage for Blocked IPs 
let otpStore = {}; // Temporary storage for OTPs 

app.use(bodyParser.json({ limit: "30mb", extended: true }));
// app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 8080;
const IP_INFO_TOKEN = process.env.IP_INFO_TOKEN;
const IPQUALITYSCORE_TOKEN = process.env.IPQUALITYSCORE_TOKEN;


const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});


app.get('/', async (req, res) => {
    res.send(`Hello World! Your IP address: ${req.ip}`);
});


// API request to check if email already registered
app.post('/api/checkEmail', async (req, res) => {
    const { email } = req.body;
    try {
        let isEmailExists = await User.findOne({ email });
        if (isEmailExists) {
            res.status(200).json({
                emailExists: true
            })
        }
        else {
            res.status(200).json({
                emailExists: false
            })
        }
    }
    catch {
        res.status(400).json({
            err: 'Error connecting to database'
        })
    }
})


// API request to send an OTP
app.post("/api/sendOtp", async (req, res) => {
    const { email, generatedOtp } = await sendOtp(req, res);
    otpStore[email] = generatedOtp;
    setTimeout(() => {
        delete otpStore[email];
    }, 300000);
});


// API request to confirm the OTP
app.post("/api/confirmOtp", async (req, res) => {
    const { email, userEnteredOtp } = req.body;
    const storedOtp = otpStore[email];

    if (userEnteredOtp === storedOtp) {
        res.status(200).json({
            success: true
        })
    } else {
        res.status(401).json({
            success: false,
        })
    }
});


app.post(
    "/api/signup",
    [
        body("firstName", "Name should contain two or more alphabets only")
            .trim()
            .isAlpha("en-IN", { ignore: " " })
            .isLength({ min: 2, max: 50 }),
        body("lastName", "Name should contain alphabets only")
            .trim()
            .isAlpha("en-IN")
            .optional({ checkFalsy: true }),
        body("password", "Password should be atleast of 6 characters").isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // console.log(req.body);
        const { firstName, lastName, email, password } = req.body;
        let newUser = new User({
            firstName,
            lastName,
            email,
            password: CryptoJS.AES.encrypt(
                password,
                process.env.CRYPTO_SECRET
            ).toString(),
        });

        try {
            await newUser.save();
            res.status(200).json({ success: "Success" });
        } catch (error) {
            console.log(error);
            res.status(200).json({ error: "Database error" });
        }
    }
);


app.post(
    "/api/login",
    body("email", "This should be an email").trim(),
    async (req, res) => {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            const bytes = CryptoJS.AES.decrypt(
                user.password,
                process.env.CRYPTO_SECRET
            );
            let decryptedPass = bytes.toString(CryptoJS.enc.Utf8);
            if (req.body.password == decryptedPass) {
                var jwtoken = Jwt.sign(
                    {
                        email: user.email,
                        password: user.password,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: "6h" }
                );
                res.status(200).json({
                    success: true,
                    id: user._id,
                    jwtoken,
                    name: user.lastName !== "" ? user.firstName + " " + user.lastName : user.firstName,
                });
            } else {
                res.status(200).json({ success: false, error: "Invalid credentials" });
            }
        } else {
            res.status(200).json({ error: "No user found" });
        }
    }
);


// API request to block an IP address
app.post(
    "/api/blockIP",
    (req, res) => {
        const { ipAddr, userEmail } = req.body;
        if(!(ipAddr in blockedIPs)) {
            blockedIPs[ipAddr] = [];
        }
        blockedIPs[ipAddr].push(userEmail);
        setTimeout(() => {
            delete blockedIPs[ipAddr];
        }, 7200000);
        // console.log(`Host requested to block IP: ${ipAddr}`);
        console.log(blockedIPs);
        res.status(200).json({
            success: true,
        });
    }
);


// API request for getting IP details
app.post(
    "/api/ipInfo",
    async (req, res) => {
        const { ipAddr } = req.body;
        const ipInfoResponse = await fetch(`https://ipinfo.io/${ipAddr}?token=${IP_INFO_TOKEN}`);
        if(ipInfoResponse.status === 200) {
            const data = await ipInfoResponse.json();
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            res.status(404).json({
                success: false,
            })
        }
    }
);


// API request for URL scanner
app.post(
    "/api/scanUrl",
    async (req, res) => {
        const { url } = req.body;
        const urlScanResponse = await fetch(
            `https://ipqualityscore.com/api/json/url/${IPQUALITYSCORE_TOKEN}/${url}`
        );
        if(urlScanResponse.status === 200) {
            const data = await urlScanResponse.json();
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            res.status(404).json({
                success: false,
            })
        }
    }
);


// connecting to MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => console.log(err.message));


// Socket code
io.on('connection', (socket) => {

    console.log(`New user connected: ${socket.id}`);

    socket.on('disconnect', () => {
        var leavingSocket = socket.id;
        if (leavingSocket in socketList) {
            delete socketList[leavingSocket];
        }
        socket.disconnect();
        console.log(`User disconnected: ${leavingSocket}`);
    });

    // To check if IP of user is blocked
    socket.on('BE-isIPblocked', ({ userEmail }) => {
        const userIp = socket.handshake.headers['x-forwarded-for'] ?
            socket.handshake.headers['x-forwarded-for'].split(',')[0] : socket.handshake.address;
        let isIPblocked = false;
        if (userIp in blockedIPs && blockedIPs[userIp].includes(userEmail)) {
            isIPblocked = true;
        }
        socket.emit('FE-errorIPblocked', { isIPblocked });
    })

    socket.on('BE-checkUser', async ({ roomId, userName }) => {
        let error = false;
        const clients = await io.in(roomId).fetchSockets();
        clients.forEach((client) => {
            if (socketList[client.id].userName == userName) {
                error = true;
            }
        });
        socket.emit('FE-errorUserExists', { error });
    });

    // Create room
    socket.on('BE-createRoom', ({ roomId, userName, userFullName, userEmail, video, audio }) => {
        socket.join(roomId);
        console.log(`${userName} created room ${roomId}`);
        const userIp = socket.handshake.headers['x-forwarded-for'] ?
            socket.handshake.headers['x-forwarded-for'].split(',')[0] : socket.handshake.address;
        socketList[socket.id] = {
            userName: userName,
            userEmail: userEmail,
            userFullName: userFullName,
            host: true,
            video: video,
            audio: audio,
            ipAddr: userIp
        }
    });

    // Join Room
    socket.on('BE-joinRoom', async ({ roomId, userName, userFullName, userEmail, video, audio }) => {
        socket.join(roomId);
        const userIp = socket.handshake.headers['x-forwarded-for'] ?
            socket.handshake.headers['x-forwarded-for'].split(',')[0] : socket.handshake.address;
        socketList[socket.id] = {
            userName: userName,
            userEmail: userEmail,
            userFullName: userFullName,
            host: false,
            video: video,
            audio: audio,
            ipAddr: userIp
        };
        console.log(`${userName} joined room ${roomId}`);
        console.log(socketList);

        const clients = await io.in(roomId).fetchSockets();
        const usersInRoom = [];
        clients.forEach((client) => {
            usersInRoom.push({
                userId: client.id, info: socketList[client.id]
            });
        });
        socket.to(roomId).emit('FE-userJoin', usersInRoom);
    });

    socket.on('BE-callUser', ({ userToCall, from, signal }) => {
        // console.log(`${from} calling user ${userToCall}`);
        io.to(userToCall).emit('FE-receiveCall', {
            signal, from, info: socketList[socket.id]
        });
    });

    socket.on('BE-acceptCall', ({ signal, caller }) => {
        // console.log(`Accept call from ${caller}`);
        io.to(caller).emit('FE-callAccepted', {
            signal, answerId: socket.id
        });
    });

    socket.on("BE-sendMessage", ({ roomId, msg, sender }) => {
        io.in(roomId).emit("FE-receiveMessage", { msg, sender });
    });

    socket.on("BE-toggleCameraAudio", ({ roomId, switchTarget }) => {
        if (switchTarget === "video") {
            socketList[socket.id].video = !socketList[socket.id].video;
        } else {
            socketList[socket.id].audio = !socketList[socket.id].audio;
        }
        socket.broadcast
            .to(roomId)
            .emit("FE-toggleCamera", { userId: socket.id, switchTarget });
    });

    socket.on("BE-getParticipants", async ({ roomId }) => {
        const clients = await io.in(roomId).fetchSockets();
        const usersInRoom = [];
        clients.forEach((client) => {
            usersInRoom.push({
                userId: client.id, info: socketList[client.id]
            });
        });
        io.to(roomId).emit('FE-getParticipants', usersInRoom);
    })

    socket.on("BE-leaveRoom", ({ roomId, leaver }) => {
        var leavingSocket = socket.id;
        console.log(`${leaver} left room ${roomId}`);
        socket.to(roomId)
            .emit("FE-userLeave", { userId: socket.id, userName: [socket.id] });
        // socket.leave(roomId);
        socket.disconnect();
        delete socketList[leavingSocket];
    });

    socket.on("BE-removeUser", async ({ roomId, clientId }) => {
        const clients = await io.in(roomId).fetchSockets();
        clients.forEach((client) => {
            if (client.id === clientId) {
                console.log(`Removing user ${socketList[clientId].userName}`)
                client.to(roomId)
                    .emit("FE-userRemoved", { userId: clientId, userName: socketList[clientId].userName });
                io.to(clientId).emit("FE-youRemoved");
                // client.disconnect(true);
                delete socketList[clientId];
            }
        });
    })

});


server.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
