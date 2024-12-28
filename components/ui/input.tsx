import * as React from 'react';

import {cn} from '@/lib/utils';

export type TInputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, TInputProps>(({className, type, onWheel, ...props}, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'flex h-10 w-full rounded-md border border-[#2D2D2D] bg-[#1A1A1A] px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0657F9] disabled:cursor-not-allowed disabled:opacity-50',
				type === 'number' &&
					'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
				className
			)}
			onWheel={type === 'number' ? e => e.currentTarget.blur() : onWheel}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = 'Input';

export {Input};
