import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlitchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
}

const GlitchButton: React.FC<GlitchButtonProps> = ({ children, className, size, ...props }) => {
    return (
        <Button
            size={size}
            className={cn(
                "relative overflow-hidden group bg-white text-black hover:bg-white/90 transition-all duration-300",
                "before:absolute before:inset-0 before:bg-black/10 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500",
                "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:translate-x-[-100%] hover:after:translate-x-[100%] after:transition-transform after:duration-500 after:delay-100",
                "hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
            <span className="absolute inset-0 block bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shine" />
        </Button>
    );
};

export default GlitchButton;
