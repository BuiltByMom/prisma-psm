import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}

/************************************************************************************************
 ** formatNumber
 ** Formats a number with commas and specified decimal places
 ** Handles BigInt conversion and string inputs
 ************************************************************************************************/
export function formatNumber({
	value,
	decimals = 2,
	compact = false
}: {
	value: bigint | string | number;
	decimals?: number;
	compact?: boolean;
}): string {
	// Convert input to number
	const num = typeof value === 'bigint' ? Number(value) / 1e18 : Number(value);

	// Handle invalid numbers
	if (isNaN(num)) {
		return '0';
	}

	// Format with Intl.NumberFormat
	return new Intl.NumberFormat('en-US', {
		notation: compact ? 'compact' : 'standard',
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(num);
}
