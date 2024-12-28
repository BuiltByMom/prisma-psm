'use client';

import * as React from 'react';
import {ChevronDown} from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import {cn} from '@/lib/utils';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({className, ...props}, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn('border-b border-[#2D2D2D]', className)}
		{...props}
	/>
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({className, children, ...props}, ref) => (
	<AccordionPrimitive.Header className={'flex'}>
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
				className
			)}
			{...props}>
			{children}
			<ChevronDown className={'size-4 shrink-0 text-[#0657F9] transition-transform duration-200'} />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({className, children, ...props}, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className={cn(
			'overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
			className
		)}
		{...props}>
		<div className={'pb-4 pt-0'}>{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
