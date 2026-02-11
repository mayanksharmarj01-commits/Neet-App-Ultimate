import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileQuestion, ArrowLeft, Users, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../store/useAuthStore';
import { Toaster, toast } from 'react-hot-toast';

const MiniQuestionCard = ({ question }) => (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-4 mt-2">
        <div className="flex items-start gap-2 mb-2">
            <FileQuestion className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className=" text-white text-sm leading-relaxed">{question.question_text}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, idx) => (
                <div
                    key={opt}
                    className={`p-2 rounded-lg ${question.correct_answer === String.fromCharCode(65 + idx)
                        ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                        : 'bg-slate-800/50 text-slate-400'
                        }`}
                >
                    {String.fromCharCode(65 + idx)}. {question[opt]}
                </div>
            ))}
        </div>
    </div>
);

const Chat = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [network, setNetwork] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    // Refs for accessing state inside socket callbacks
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const selectedUserRef = useRef(null);
    const userRef = useRef(null);

    // Keep refs in sync with state
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // Initialize socket connection ONCE
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('new_message', (message) => {
            console.log('New message received:', message);

            const currentSelected = selectedUserRef.current;
            const currentUser = userRef.current;

            // Check if the message belongs to the currently open conversation
            const isRelevant = currentSelected &&
                (message.sender_id === currentSelected.id || message.receiver_id === currentSelected.id);

            if (isRelevant) {
                setMessages(prev => [...prev, message]);
            } else if (message.sender_id !== currentUser?.id) {
                // Determine sender name (might need to find in network list if not in message)
                const senderName = message.sender_name || 'Someone';

                toast.success(`New message from ${senderName}`, {
                    icon: '💬',
                    duration: 4000,
                    position: 'top-right'
                });
            }
        });

        newSocket.on('user_typing', ({ userId }) => {
            if (selectedUserRef.current && userId === selectedUserRef.current.id) {
                setIsTyping(true);
            }
        });

        newSocket.on('user_stop_typing', ({ userId }) => {
            if (selectedUserRef.current && userId === selectedUserRef.current.id) {
                setIsTyping(false);
            }
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            if (newSocket) newSocket.close();
        };
    }, []); // Empty dependency array = run once

    // Fetch network on mount
    useEffect(() => {
        fetchNetwork();
    }, []);

    // Fetch messages when user is selected
    useEffect(() => {
        if (selectedUser) {
            setMessages([]); // Clear previous messages immediately
            setIsTyping(false); // Reset typing status
            fetchConversation(selectedUser.id);
        }
    }, [selectedUser]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const fetchNetwork = async () => {
        try {
            const response = await axiosClient.get('/users/network');
            setNetwork(response.data.data.network);
        } catch (error) {
            console.error('Failed to fetch network:', error);
        }
    };

    const fetchConversation = async (userId) => {
        try {
            const response = await axiosClient.get(`/messages/conversation/${userId}`);
            // Only update if we are still looking at the same user
            if (selectedUserRef.current?.id === userId) {
                setMessages(response.data.data.messages || []);
            }
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
            // Don't show error toast - empty conversation is normal
            setMessages([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        try {
            const response = await axiosClient.post('/messages/send', {
                receiverId: selectedUser.id,
                content: newMessage
            });

            // Optimistically add message (backend usually emits it back via socket too, 
            // but we might want to deduplicate or just rely on socket)
            // If backend emits to sender too, we don't need this. 
            // Usually standard practice is to receive your own message via socket or add optimistically.
            // Based on previous code, it was adding manually.

            // Let's rely on the socket 'new_message' event for consistency if the backend broadcasts to sender.
            // If not, we add it here. Let's assume we add it here to be instant.

            // Actually, checking previous code: setMessages(prev => [...prev, response.data.data.message]);
            // And socket listener had: if (selectedUser && ...) setMessages...

            // We need to prevent double addition if backend sends back to sender.
            // For now, let's update state manually to ensure responsiveness, 
            // and rely on React key (message.id) to handle duplicates if mapped correctly, 
            // OR checks in setMessages.

            // Safest: setMessages. But let's see if we can just wait for socket? 
            // No, instant feedback is better.

            const sentMsg = response.data.data.message;
            setMessages(prev => {
                if (prev.some(m => m.id === sentMsg.id)) return prev;
                return [...prev, sentMsg];
            });

            setNewMessage('');
            socket?.emit('stop_typing', { receiverId: selectedUser.id });
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket || !selectedUser) return;

        // Emit typing event
        socket.emit('typing', { receiverId: selectedUser.id });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { receiverId: selectedUser.id });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            <Toaster position="top-right" />

            {/* Sidebar - Network List */}
            <div className="w-80 border-r border-white/10 bg-slate-900/50 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Users className="text-primary-400" />
                        My Network
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{network.length} connections</p>
                </div>

                {/* Network List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {network.length === 0 && (
                        <div className="text-center text-slate-500 py-12">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No connections yet</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 text-primary-400 hover:text-primary-300 text-sm font-bold"
                            >
                                Find study partners
                            </button>
                        </div>
                    )}

                    {network.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedUser(contact)}
                            className={`w-full p-4 rounded-xl transition-all text-left ${selectedUser?.id === contact.id
                                ? 'bg-primary-500/20 border-2 border-primary-500/40'
                                : 'bg-slate-800/50 border-2 border-transparent hover:bg-slate-800 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{contact.name}</h3>
                                    <p className="text-xs text-slate-400">{contact.xp || 0} XP</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/10 bg-slate-900/30">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                    {selectedUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedUser.name}</h2>
                                    {isTyping && (
                                        <p className="text-sm text-primary-400 flex items-center gap-1">
                                            <Circle className="w-2 h-2 animate-pulse" fill="currentColor" />
                                            typing...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                    <motion.div
                                        key={msg.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${isMe
                                                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white'
                                                    : 'bg-slate-800 text-slate-100'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                {msg.question_id && msg.question_text && (
                                                    <MiniQuestionCard question={msg} />
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 mt-1 px-2">
                                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-white/10 bg-slate-900/30">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-slate-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="btn-premium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <Users className="w-20 h-20 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Select a connection to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
