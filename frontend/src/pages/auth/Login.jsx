import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Trophy, Zap, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { Toaster, toast } from 'react-hot-toast';
import Logo from '../../components/common/Logo';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { login, googleSignIn, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        const result = await googleSignIn();
        if (result.success) {
            toast.success('Welcome! 🎉');
            navigate('/');
        } else {
            toast.error(result.message || 'Google sign-in failed');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Welcome back! 🚀');
            navigate('/');
        } else {
            toast.error(result.message || 'Login failed');
        }
    };

    // Floating particles animation
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-slate-950 relative overflow-hidden">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid #334155'
                }
            }} />

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.2, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-1/2 -left-1/4 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-sky-500 to-blue-600 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.25, 0.15, 0.25],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute -bottom-1/2 -right-1/4 w-96 h-96 md:w-[700px] md:h-[700px] bg-gradient-to-tl from-indigo-600 to-purple-600 rounded-full blur-[120px]"
                />

                {/* Floating Particles */}
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute rounded-full bg-white/20"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-card p-8 md:p-12 w-full max-w-md relative z-10 border border-white/10"
            >
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center mb-8"
                >
                    <Logo size="xl" className="mb-4 shadow-2xl shadow-sky-500/20" />
                </motion.div>


                <motion.p
                    variants={itemVariants}
                    className="text-slate-400 text-center mb-8 text-sm md:text-base"
                >
                    Welcome back, future achiever 🚀
                </motion.p>

                {/* Features Pills */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-wrap gap-2 justify-center mb-8"
                >
                    {[
                        { icon: BookOpen, text: 'Smart Learning' },
                        { icon: Trophy, text: 'Rank Booster' },
                        { icon: Zap, text: 'AI Powered' }
                    ].map(({ icon: Icon, text }, idx) => (
                        <motion.div
                            key={text}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300"
                        >
                            <Icon className="w-3.5 h-3.5 text-sky-400" />
                            <span>{text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <motion.input
                                type="email"
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all text-white placeholder-slate-500 backdrop-blur-sm"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                whileFocus={{ scale: 1.01 }}
                                required
                            />
                            <AnimatePresence>
                                {focusedField === 'email' && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <motion.input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all text-white placeholder-slate-500 backdrop-blur-sm"
                                placeholder="••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                whileFocus={{ scale: 1.01 }}
                                required
                            />
                            <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </motion.button>
                            <AnimatePresence>
                                {focusedField === 'password' && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-indigo-500"
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden px-6 py-4 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                            initial={{ x: '100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ type: "tween", duration: 0.3 }}
                        />
                    </motion.button>

                    {/* OR Divider */}
                    <motion.div
                        variants={itemVariants}
                        className="flex items-center gap-4 my-6"
                    >
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        <span className="text-slate-500 text-sm font-medium">OR</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                    </motion.div>

                    {/* Google Sign-In Button */}
                    <motion.button
                        variants={itemVariants}
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 disabled:opacity-70 disabled:cursor-not-allowed"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z" />
                                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z" />
                                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z" />
                                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z" />
                            </svg>
                            Continue with Google
                        </span>
                    </motion.button>
                </form>

                <motion.div
                    variants={itemVariants}
                    className="mt-8 text-center"
                >
                    <p className="text-slate-400 text-sm">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="text-sky-400 font-semibold hover:text-sky-300 transition-colors inline-flex items-center gap-1 group"
                        >
                            Register now
                            <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </Link>
                    </p>
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    variants={itemVariants}
                    className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"
                >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Trusted by 100,000+ aspirants</span>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
