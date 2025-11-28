import * as React from 'react';
import { cn } from '@/utils/helpers';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm',
          {
            'bg-gradient-to-r from-primary to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]':
              variant === 'default',
            'border border-orange-200/70 bg-white/70 text-primary backdrop-blur hover:border-orange-300 hover:bg-orange-50/80':
              variant === 'outline',
            'text-primary hover:bg-orange-50 hover:text-primary': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
          },
          {
            'h-11 px-5': size === 'default',
            'h-10 rounded-lg px-4 text-sm': size === 'sm',
            'h-12 rounded-xl px-7 text-base': size === 'lg',
            'h-11 w-11': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
