import * as React from 'react';

import {cn} from '@/lib/utils';

export type TButtonProps = {
	variant?: 'default' | 'secondary' | 'ghost';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, TButtonProps>(({className, variant = 'default', ...props}, ref) => {
	return (
		<button
			className={cn(
				'min-h-10 px-4 py-2',
				'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
				'disabled:cursor-not-allowed',
				{
					'bg-[#0657F9] text-white hover:bg-[#0444c9] dark:bg-[#0657F9] dark:text-white dark:hover:bg-[#0444c9]':
						variant === 'default',
					'bg-[#1E1E1E] text-white hover:bg-[#2D2D2D] dark:bg-[#1E1E1E] dark:text-white dark:hover:bg-[#2D2D2D]':
						variant === 'secondary',
					'text-white hover:bg-[#1E1E1E] dark:text-white dark:hover:bg-[#1E1E1E]': variant === 'ghost'
				},
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export {Button};
