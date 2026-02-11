import React from 'react';

const Logo = ({ className = "", size = "md" }) => {
    const sizeMap = {
        xs: "h-6",
        sm: "h-8",
        md: "h-12",
        lg: "h-20",
        xl: "h-32"
    };

    return (
        <div className={`relative overflow-hidden flex items-center justify-center bg-[#001a3d]/40 backdrop-blur-sm border border-white/10 rounded-2xl ${sizeMap[size] || sizeMap.md} ${className}`}>
            <img
                src="/logo.png"
                alt="Neetu JEE Logo"
                className="h-[380%] w-auto max-w-none transform transition-transform duration-700 hover:scale-110"
                style={{
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.4))'
                }}
            />
        </div>
    );
};

export default Logo;
