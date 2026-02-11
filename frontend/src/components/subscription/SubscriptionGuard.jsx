import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const SubscriptionGuard = ({ children, requiredPlan = 'premium', fallback }) => {
    const { user } = useAuthStore();

    // Basic check: if user is not logged in or doesn't have the required plan
    const hasAccess = user && (user.subscription_type === requiredPlan || user.subscription_type === 'pro');

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-slate-900 group"
        >
            <div className="absolute inset-0 backdrop-blur-[2px] bg-slate-950/50 z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                    <Lock className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">
                    Unlock AIIMS-level questions, detailed video solutions, and teacher tools.
                </p>
                <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold hover:scale-105 transition-transform flex items-center gap-2">
                    <Crown size={18} />
                    Upgrade Now
                </button>
            </div>

            {/* Blurred preview of children behind the overlay */}
            <div className="opacity-20 pointer-events-none filter blur-sm">
                {children}
            </div>
        </motion.div>
    );
};

export default SubscriptionGuard;
