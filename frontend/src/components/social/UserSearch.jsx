import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, UserMinus, X, Loader2, Trophy, User } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-hot-toast';

const UserSearch = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [followingStates, setFollowingStates] = useState({});

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axiosClient.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
            setResults(response.data.data.users);

            // Initialize following states
            const states = {};
            response.data.data.users.forEach(user => {
                states[user.id] = user.is_following;
            });
            setFollowingStates(states);
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            await axiosClient.post(`/users/follow/${userId}`);
            setFollowingStates(prev => ({ ...prev, [userId]: true }));
            toast.success('Following successfully! 🎯');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to follow user');
        }
    };

    const handleUnfollow = async (userId) => {
        try {
            await axiosClient.delete(`/users/unfollow/${userId}`);
            setFollowingStates(prev => ({ ...prev, [userId]: false }));
            toast.success('Unfollowed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unfollow user');
        }
    };

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl glass-card p-6 max-h-[80vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Search className="text-primary-400" />
                        Find Study Partners
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="text-slate-400" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-white placeholder-slate-500"
                        autoFocus
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5 animate-spin" />
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    <AnimatePresence mode="popLayout">
                        {results.length === 0 && query.trim() && !isSearching && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-slate-500"
                            >
                                <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>No users found matching "{query}"</p>
                            </motion.div>
                        )}

                        {results.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-900 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* User Info */}
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Trophy className="w-4 h-4 text-amber-400" />
                                                <span>{user.xp || 0} XP</span>
                                            </div>
                                            <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span>{user.followers_count || 0} followers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Follow/Unfollow Button */}
                                <button
                                    onClick={() => followingStates[user.id] ? handleUnfollow(user.id) : handleFollow(user.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${followingStates[user.id]
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25'
                                        }`}
                                >
                                    {followingStates[user.id] ? (
                                        <>
                                            <UserMinus className="w-4 h-4" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            Follow
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {!query.trim() && (
                    <div className="text-center py-12 text-slate-500">
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Start typing to find study partners</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default UserSearch;
