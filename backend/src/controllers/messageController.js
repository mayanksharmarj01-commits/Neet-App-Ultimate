const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

class MessageController {
    // Send a message
    sendMessage = catchAsync(async (req, res, next) => {
        const { receiverId, content, questionId } = req.body;
        const senderId = req.user.id;

        if (!receiverId || (!content && !questionId)) {
            return next(new AppError('Receiver and content/question are required', 400));
        }

        if (receiverId === senderId) {
            return next(new AppError('You cannot message yourself', 400));
        }

        const result = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, content, question_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, sender_id, receiver_id, content, question_id, is_read, created_at`,
            [senderId, receiverId, content || '', questionId || null]
        );


        // Emit socket event if io is available
        if (req.app.get('io')) {
            const message = result.rows[0];
            // Emit to both sender and receiver for consistency
            // Receiver gets the message in real-time
            req.app.get('io').to(receiverId.toString()).emit('new_message', message);
            // Sender also receives the socket event (frontend has deduplication logic)
            req.app.get('io').to(senderId.toString()).emit('new_message', message);
        }


        res.status(201).json({
            status: 'success',
            data: {
                message: result.rows[0]
            }
        });
    });

    // Get conversation between two users
    getConversation = async (req, res) => {
        try {
            const { userId } = req.params;
            const currentUserId = req.user.id;

            console.log(`📩 Fetching conversation between User ${currentUserId} and User ${userId}`);

            const query = `
            SELECT 
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.question_id,
                m.is_read,
                m.created_at,
                sender.name as sender_name,
                receiver.name as receiver_name,
                q.question_text,
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
                q.correct_answer
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            LEFT JOIN questions q ON m.question_id = q.id
            WHERE 
                (m.sender_id = $1 AND m.receiver_id = $2)
                OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.created_at ASC
        `;

            const result = await db.query(query, [currentUserId, userId]);

            console.log(`✅ Found ${result.rows.length} messages`);

            // Mark messages as read
            await db.query(
                'UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE',
                [currentUserId, userId]
            );

            res.status(200).json({
                status: 'success',
                results: result.rows.length,
                data: {
                    messages: result.rows
                }
            });
        } catch (error) {
            console.error('❌ Error fetching conversation:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to load messages',
                error: error.message
            });
        }
    };

    // Get recent conversations list
    getConversations = catchAsync(async (req, res) => {
        const currentUserId = req.user.id;

        const query = `
            WITH latest_messages AS (
                SELECT DISTINCT ON (
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id
                        ELSE sender_id
                    END
                )
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.created_at,
                CASE 
                    WHEN sender_id = $1 THEN receiver_id
                    ELSE sender_id
                END as other_user_id,
                (SELECT COUNT(*) FROM messages 
                 WHERE receiver_id = $1 
                 AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
                 AND is_read = FALSE) as unread_count
                FROM messages m
                WHERE m.sender_id = $1 OR m.receiver_id = $1
                ORDER BY 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id
                        ELSE sender_id
                    END,
                    m.created_at DESC
            )
            SELECT 
                lm.*,
                u.name as other_user_name,
                u.xp as other_user_xp
            FROM latest_messages lm
            JOIN users u ON lm.other_user_id = u.id
            ORDER BY lm.created_at DESC
        `;

        const result = await db.query(query, [currentUserId]);

        res.status(200).json({
            status: 'success',
            results: result.rows.length,
            data: {
                conversations: result.rows
            }
        });
    });
}

module.exports = new MessageController();
