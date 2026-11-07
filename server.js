{\rtf1\ansi\ansicpg950\cocoartf2820
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red220\green220\blue220;\red12\green12\blue12;}
{\*\expandedcolortbl;;\cssrgb\c89020\c89020\c89020;\cssrgb\c5098\c5098\c5098;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
const express = require('express');\
const http = require('http');\
const \{ Server \} = require('socket.io');\
const path = require('path');\
\
const app = express();\
const server = http.createServer(app);\
const io = new Server(server);\
\
app.use(express.static(__dirname));\
\
const ALL_CARDS = [\
  \{ id: "card_0", dynasty: "\uc0\u31206 ", name: "\u31206 \u22987 \u30343 ", type: "\u20154 \u29289 ", skill: "\u20845 \u21512 \u19968 \u32113 ", desc: "\u31062 \u40845 \u20043 \u23041 \u65292 \u27243 \u25475 \u20845 \u21512 " \},\
  \{ id: "card_1", dynasty: "\uc0\u31206 ", name: "\u39640 \u32026 \u36557 \u21519 \u20433 ", type: "\u20154 \u29289 ", skill: "\u34909 \u37586 \u38519 \u38499 ", desc: "\u30334 \u25136 \u31934 \u37555 \u65292 \u23041 \u38663 \u27801 \u22580 " \},\
  \{ id: "card_2", dynasty: "\uc0\u31206 ", name: "\u33836 \u37324 \u38263 \u22478 ", type: "\u36628 \u21161 ", skill: "\u22266 \u33509 \u37329 \u28271 ", desc: "\u38450 \u31142 \u22806 \u25973 \u65292 \u27704 \u22266 \u37002 \u38450 " \},\
  \{ id: "card_3", dynasty: "\uc0\u35199 \u28450 ", name: "\u26446 \u24291 ", type: "\u20154 \u29289 ", skill: "\u39131 \u23559 \u36557 ", desc: "\u20294 \u20351 \u40845 \u22478 \u39131 \u23559 \u22312 \u65292 \u19981 \u25945 \u32993 \u39340 \u24230 \u38512 \u23665 " \},\
  \{ id: "card_4", dynasty: "\uc0\u35199 \u28450 ", name: "\u38669 \u21435 \u30149 ", type: "\u20154 \u29289 ", skill: "\u23553 \u29436 \u23621 \u32997 ", desc: "\u21256 \u22900 \u26410 \u28357 \u65292 \u28961 \u20197 \u23478 \u28858 " \},\
  \{ id: "card_5", dynasty: "\uc0\u35199 \u28450 ", name: "\u25512 \u24681 \u20196 ", type: "\u36628 \u21161 ", skill: "\u21066 \u24369 \u35576 \u20399 ", desc: "\u24039 \u20998 \u23553 \u22283 \u65292 \u19981 \u36027 \u19968 \u20853 \u19968 \u21330 " \},\
  \{ id: "card_6", dynasty: "\uc0\u21776 ", name: "\u21776 \u22826 \u23447 ", type: "\u20154 \u29289 ", skill: "\u35998 \u35264 \u20043 \u27835 ", desc: "\u20197 \u37509 \u28858 \u37857 \u65292 \u21487 \u20197 \u27491 \u34915 \u20896 " \},\
  \{ id: "card_7", dynasty: "\uc0\u21776 ", name: "\u29572 \u22872 \u27861 \u24107 ", type: "\u20154 \u29289 ", skill: "\u35199 \u34892 \u21462 \u32147 ", desc: "\u27511 \u32147 \u20061 \u27515 \u19968 \u29983 \u65292 \u27714 \u21462 \u30495 \u32147 " \}\
];\
\
let rooms = \{\};\
\
io.on('connection', (socket) => \{\
    console.log(`\uc0\u29609 \u23478 \u36899 \u32218 : $\{socket.id\}`);\
\
    socket.on('create_room', (roomId) => \{\
        if (!roomId || roomId.trim() === "") \{\
            socket.emit('error_msg', '\uc0\u35531 \u36664 \u20837 \u26377 \u25928 \u30340 \u25151 \u38291 \u34399 \u30908 \u65281 ');\
            return;\
        \}\
        roomId = roomId.trim();\
        if (rooms[roomId]) \{\
            socket.emit('error_msg', '\uc0\u27492 \u25151 \u38291 \u34399 \u30908 \u24050 \u34987 \u20351 \u29992 \u65281 ');\
            return;\
        \}\
\
        socket.join(roomId);\
        rooms[roomId] = \{ players: [socket], state: \{\}, turn: null \};\
        socket.emit('room_created', roomId);\
    \});\
\
    socket.on('join_room', (roomId) => \{\
        if (!roomId || roomId.trim() === "") \{\
            socket.emit('error_msg', '\uc0\u35531 \u36664 \u20837 \u26377 \u25928 \u30340 \u25151 \u38291 \u34399 \u30908 \u65281 ');\
            return;\
        \}\
        roomId = roomId.trim();\
        const room = rooms[roomId];\
        if (!room) \{\
            socket.emit('error_msg', '\uc0\u25214 \u19981 \u21040 \u27492 \u25151 \u38291 \u65292 \u35531 \u30906 \u35469 \u25151 \u34399 \u26159 \u21542 \u27491 \u30906 \u65281 ');\
            return;\
        \}\
        if (room.players.length >= 2) \{\
            socket.emit('error_msg', '\uc0\u27492 \u25151 \u38291 \u20154 \u25976 \u24050 \u28415 \u65281 ');\
            return;\
        \}\
\
        const hostSocket = room.players[0];\
        socket.join(roomId);\
        room.players.push(socket);\
\
        room.state = \{\
            [hostSocket.id]: \{ hp: 300, hand: getRandomCards(5), active: null, supportArea: [] \},\
            [socket.id]: \{ hp: 300, hand: getRandomCards(5), active: null, supportArea: [] \}\
        \};\
        room.turn = hostSocket.id;\
\
        io.to(roomId).emit('game_start', \{ roomId \});\
        broadcastGameState(roomId);\
    \});\
\
    socket.on('play_card', (\{ roomId, cardIndex \}) => \{\
        const room = rooms[roomId];\
        if (!room || room.turn !== socket.id) return;\
\
        const pState = room.state[socket.id];\
        if (cardIndex < 0 || cardIndex >= pState.hand.length) return;\
\
        const card = pState.hand.splice(cardIndex, 1)[0];\
        if (card.type === "\uc0\u20154 \u29289 ") \{\
            if (pState.active) \{\
                pState.hand.push(pState.active); // \uc0\u26367 \u25563 \u26178 \u23559 \u33290 \u20154 \u29289 \u25918 \u22238 \u25163 \u29260 \
            \}\
            pState.active = card;\
        \} else if (card.type === "\uc0\u36628 \u21161 ") \{\
            pState.supportArea.push(card);\
        \}\
        broadcastGameState(roomId);\
    \});\
\
    socket.on('attack', (\{ roomId, answerCorrect \}) => \{\
        const room = rooms[roomId];\
        if (!room || room.turn !== socket.id) return;\
\
        const pState = room.state[socket.id];\
        const opSocket = room.players.find(p => p.id !== socket.id);\
        const opState = room.state[opSocket.id];\
\
        if (!pState.active) \{\
            socket.emit('error_msg', '\uc0\u35531 \u20808 \u36984 \u25799 \u27511 \u21490 \u20154 \u29289 \u25918 \u22312 \u25136 \u38499 \u19978 \u25165 \u33021 \u30332 \u21205 \u25915 \u25802 \u65281 ');\
            return;\
        \}\
\
        let dmg = answerCorrect ? 80 : 40;\
        opState.hp -= dmg;\
        if (opState.hp < 0) opState.hp = 0;\
\
        io.to(roomId).emit('battle_log', \{ \
            msg: `\uc0\u12304 $\{pState.active.name\}\u12305 \u30332 \u21205 \u25915 \u25802 \u65281 \u27511 \u21490 \u32771 \u38988 $\{answerCorrect ? '\u12304 \u31572 \u23565 \u12305 (\u26292 \u25802  80 \u40670 )' : '\u12304 \u31572 \u37679 \u12305 (\u26222 \u36890  40 \u40670 )'\}\u65292 \u23565 \u25163 \u21463 \u21040  $\{dmg\} \u40670 \u20663 \u23475 \u65281 ` \
        \});\
\
        if (opState.hp <= 0) \{\
            io.to(roomId).emit('game_over', \{ winner: socket.id \});\
            delete rooms[roomId];\
        \} else \{\
            // \uc0\u25915 \u25802 \u23436 \u25104 \u65292 \u22238 \u21512 \u32080 \u26463 \u20006 \u20999 \u25563 \u32102 \u23565 \u25163 \u65292 \u38568 \u27231 \u22686 \u30332  2 \u24373 \u21345 \u33267 \u19979 \u20491 \u29609 \u23478 \u25163 \u29260 \
            room.turn = opSocket.id;\
            const nextState = room.state[opSocket.id];\
            nextState.hand.push(...getRandomCards(2));\
            io.to(roomId).emit('battle_log', \{ msg: `\uc0\u25915 \u25802 \u23436 \u25104 \u65292 \u22238 \u21512 \u32080 \u26463 \u12290 \u23565 \u25163 \u29554 \u24471  2 \u24373 \u35036 \u32102 \u21345 \u29260 \u12290 ` \});\
            broadcastGameState(roomId);\
        \}\
    \});\
\
    socket.on('end_turn', (roomId) => \{\
        const room = rooms[roomId];\
        if (!room || room.turn !== socket.id) return;\
\
        const nextSocket = room.players.find(p => p.id !== socket.id);\
        room.turn = nextSocket.id;\
\
        // \uc0\u38568 \u27231 \u22686 \u30332  2 \u24373 \u21345 \u33267 \u25163 \u29260 \
        const nextState = room.state[nextSocket.id];\
        nextState.hand.push(...getRandomCards(2));\
\
        io.to(roomId).emit('battle_log', \{ msg: `\uc0\u29609 \u23478 \u32080 \u26463 \u22238 \u21512 \u65292 \u23565 \u25163 \u29554 \u24471  2 \u24373 \u35036 \u32102 \u21345 \u29260 \u12290 ` \});\
        broadcastGameState(roomId);\
    \});\
\
    socket.on('disconnect', () => \{\
        for (let roomId in rooms) \{\
            let room = rooms[roomId];\
            if (room.players.includes(socket)) \{\
                room.players = room.players.filter(p => p !== socket);\
                if (room.players.length === 0) \{\
                    delete rooms[roomId];\
                \} else \{\
                    io.to(roomId).emit('error_msg', '\uc0\u23565 \u25163 \u24050 \u26039 \u32218 \u38626 \u38283 \u36938 \u25138 \u12290 ');\
                \}\
            \}\
        \}\
    \});\
\});\
\
function getRandomCards(count) \{\
    let res = [];\
    for(let i=0; i<count; i++) \{\
        let card = ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)];\
        res.push(JSON.parse(JSON.stringify(card)));\
    \}\
    return res;\
\}\
\
function broadcastGameState(roomId) \{\
    const room = rooms[roomId];\
    if (!room || room.players.length < 2) return;\
    room.players.forEach(p => \{\
        const opId = room.players.find(x => x.id !== p.id).id;\
        p.emit('game_state_update', \{\
            myState: room.state[p.id],\
            opState: room.state[opId],\
            isMyTurn: room.turn === p.id\
        \});\
    \});\
\}\
\
const PORT = process.env.PORT || 3000;\
server.listen(PORT, () => console.log(`\uc0\u12298 \u33521 \u39746 \u27770 \u12299 \u23565 \u25136 \u20282 \u26381 \u22120 \u36939 \u34892 \u26044  port $\{PORT\}`));}