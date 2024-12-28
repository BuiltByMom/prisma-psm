'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import {cn} from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({className, ...props}, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn('inline-flex h-12 items-center justify-center rounded-lg bg-[#1A1A1A] p-1', className)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({className, ...props}, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			'inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2.5 text-sm font-medium text-gray-400 transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#0657F9] data-[state=active]:text-white',
			className
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({className, ...props}, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300',
			className
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
