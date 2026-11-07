{\rtf1\ansi\ansicpg950\cocoartf2820
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // server.js - \uc0\u12298 \u33521 \u39746 \u27770 \u12299 WebSocket \u21363 \u26178 \u23565 \u25136 \u20282 \u26381 \u22120 \
const http = require('http');\
const express = require('express');\
const \{ Server \} = require('socket.io');\
\
const app = express();\
const server = http.createServer(app);\
const io = new Server(server, \{\
    cors: \{ origin: "*" \}\
\});\
\
// \uc0\u20786 \u23384 \u23565 \u25136 \u25151 \u38291 \u29376 \u24907 \
const rooms = \{\};\
\
io.on('connection', (socket) => \{\
    console.log(`\uc0\u29609 \u23478 \u36899 \u32218 : $\{socket.id\}`);\
\
    // \uc0\u24314 \u31435 \u25151 \u38291 \
    socket.on('createRoom', (roomCode) => \{\
        if (rooms[roomCode]) \{\
            socket.emit('errorMsg', '\uc0\u25151 \u38291 \u20195 \u30908 \u24050 \u23384 \u22312 \u65281 ');\
            return;\
        \}\
        rooms[roomCode] = \{\
            players: [\{ id: socket.id, hp: 60, card: null \}],\
            turn: socket.id\
        \};\
        socket.join(roomCode);\
        socket.emit('roomCreated', roomCode);\
        console.log(`\uc0\u25151 \u38291 \u24314 \u31435 : $\{roomCode\}`);\
    \});\
\
    // \uc0\u21152 \u20837 \u25151 \u38291 \
    socket.on('joinRoom', (roomCode) => \{\
        const room = rooms[roomCode];\
        if (!room) \{\
            socket.emit('errorMsg', '\uc0\u25214 \u19981 \u21040 \u27492 \u25151 \u38291 \u65281 ');\
            return;\
        \}\
        if (room.players.length >= 2) \{\
            socket.emit('errorMsg', '\uc0\u25151 \u38291 \u24050 \u28415 \u65281 ');\
            return;\
        \}\
        room.players.push(\{ id: socket.id, hp: 60, card: null \});\
        socket.join(roomCode);\
        \
        // \uc0\u36890 \u30693 \u38617 \u26041 \u23565 \u25136 \u38283 \u22987 \
        io.to(roomCode).emit('gameStart', \{ players: room.players \});\
        console.log(`\uc0\u29609 \u23478 \u21152 \u20837 \u25151 \u38291 : $\{roomCode\}`);\
    \});\
\
    // \uc0\u29609 \u23478 \u20986 \u29260 \u21516 \u27493 \
    socket.on('playCardData', (\{ roomCode, card \}) => \{\
        const room = rooms[roomCode];\
        if (!room) return;\
        \
        // \uc0\u24291 \u25773 \u32102 \u23565 \u25163 \
        socket.to(roomCode).emit('opponentPlayed', \{ card, playerId: socket.id \});\
    \});\
\
    // \uc0\u25915 \u25802 \u33287 \u31572 \u38988 \u21516 \u27493 \
    socket.on('attackAction', (\{ roomCode, damage, isCorrect \}) => \{\
        const room = rooms[roomCode];\
        if (!room) return;\
\
        // \uc0\u24291 \u25773 \u25915 \u25802 \u32080 \u26524 \u32102 \u25151 \u38291 \u20839 \u25152 \u26377 \u20154 \
        io.to(roomCode).emit('battleUpdate', \{ attacker: socket.id, damage, isCorrect \});\
    \});\
\
    socket.on('disconnect', () => \{\
        console.log(`\uc0\u29609 \u23478 \u38626 \u32218 : $\{socket.id\}`);\
        // \uc0\u21487 \u20197 \u22312 \u27492 \u28165 \u29702 \u25151 \u38291 \u36039 \u26009 \
    \});\
\});\
\
const PORT = process.env.PORT || 3000;\
server.listen(PORT, () => \{\
    console.log(`\uc0\u12298 \u33521 \u39746 \u27770 \u12299 \u20282 \u26381 \u22120 \u24050 \u22312  port $\{PORT\} \u21855 \u21205 `);\
\});\
}