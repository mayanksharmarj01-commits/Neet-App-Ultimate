const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

class RoomManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map(); // roomId -> { players: [], config: {}, state: 'waiting' }
    }

    createRoom(hostId, config) {
        const roomId = uuidv4().substring(0, 8);
        const room = {
            id: roomId,
            hostId,
            players: [],
            config: {
                pattern: config.pattern || 'mixed', // 'assertion_only', 'diagram_only'
                questionCount: config.questionCount || 20,
                timePerQuestion: config.timePerQuestion || 60,
            },
            state: 'waiting',
            currentQuestionIndex: 0,
            scores: {}
        };

        this.rooms.set(roomId, room);
        return roomId;
    }

    joinRoom(roomId, player) {
        const room = this.rooms.get(roomId);
        if (!room) return { error: 'Room not found' };
        if (room.state !== 'waiting') return { error: 'Game already started' };

        room.players.push(player);
        room.scores[player.id] = 0;

        this.io.to(roomId).emit('player_joined', {
            players: room.players
        });

        return { success: true, room };
    }

    async startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.state = 'playing';

        // Fetch questions based on pattern
        let query = `SELECT * FROM questions ORDER BY RANDOM() LIMIT $1`;
        let params = [room.config.questionCount];

        if (room.config.pattern === 'assertion_only') {
            query = `SELECT * FROM questions WHERE type = 'Assertion_Reason' ORDER BY RANDOM() LIMIT $1`;
        } else if (room.config.pattern === 'diagram_only') {
            query = `SELECT * FROM questions WHERE type = 'Diagram_Based' ORDER BY RANDOM() LIMIT $1`;
        }

        try {
            const { rows } = await db.query(query, params);
            room.questions = rows;

            this.io.to(roomId).emit('game_started', {
                totalQuestions: room.questions.length
            });

            this.nextQuestion(roomId);
        } catch (err) {
            console.error('Failed to start game:', err);
            this.io.to(roomId).emit('error', 'Failed to fetch questions');
        }
    }

    nextQuestion(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || room.currentQuestionIndex >= room.questions.length) {
            this.endGame(roomId);
            return;
        }

        const question = room.questions[room.currentQuestionIndex];
        room.currentQuestionIndex++;

        this.io.to(roomId).emit('new_question', {
            question,
            timeLeft: room.config.timePerQuestion,
            questionNumber: room.currentQuestionIndex
        });

        // Auto-advance timer
        setTimeout(() => {
            this.nextQuestion(roomId);
        }, room.config.timePerQuestion * 1000);
    }

    submitAnswer(roomId, playerId, answerData) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        // Verify answer
        // For simplicity, assuming backend check here. In reality, compare with stored answer.
        const currentQ = room.questions[room.currentQuestionIndex - 1];

        // Basic check - would need robust JSON comparison for complex types
        const isCorrect = JSON.stringify(answerData.answer) === JSON.stringify(currentQ.correct_answer);

        if (isCorrect) {
            room.scores[playerId] += 10; // Simple scoring
            this.io.to(roomId).emit('player_scored', {
                playerId,
                score: room.scores[playerId]
            });
        }
    }

    endGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.state = 'finished';
        this.io.to(roomId).emit('game_over', {
            scores: room.scores
        });

        this.rooms.delete(roomId);
    }
}

module.exports = RoomManager;
