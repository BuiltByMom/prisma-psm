'use client';

import type {ReactNode} from 'react';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Card} from '@/components/ui/card';

type TFAQItem = {
	question: string;
	answer: string | ReactNode;
};

const FAQ_ITEMS: TFAQItem[] = [
	{
		question: 'What is Prisma PSM?',
		answer: (
			<div className={'space-y-4'}>
				<p>{'The Prisma PSM (Peg Stability Module) serves two key purposes:'}</p>
				<ol className={'list-decimal space-y-2 pl-4'}>
					<li>
						{'Close loans: Allows borrowers to repay and close their positions using crvUSD at a 1:1 rate.'}
					</li>
					<li>
						{
							'Purchase crvUSD: Allows anyone to permissionlessly burn mkUSD or ULTRA in exchange for crvUSD at a 1:1 rate.'
						}
					</li>
				</ol>
				<p>{'There are two separate PSMs: one for mkUSD and one for ULTRA.'}</p>
			</div>
		)
	},
	{
		question: 'How do I repay my loan using the PSM?',
		answer: 'You can use the Prisma PSM to repay your loan with crvUSD at a 1:1 rate. This action will reduce your debt and close your open loan on Prisma.'
	},
	{
		question: 'Why is the PSM important during the shutdown?',
		answer: 'The PSM provides a stable and predictable mechanism for borrowers to close their positions. It assits borrowers by eliminating the need to purchase mkUSD or ULTRA from the market, where prices may be significantly inflated.'
	},
	{
		question: 'How can I purchase crvUSD from the PSM?',
		answer: 'The PSM is perpetually willing to exchange its crvUSD balance at a 1:1 rate for mkUSD or ULTRA.'
	},
	{
		question: 'Why do I need to approve first?',
		answer: 'Before performing any loan repayments via the PSM, you must approve the PSM to interact with your position via the Borrower Operations contract.'
	}
];

/************************************************************************************************
 ** FAQCard Component
 ** Displays frequently asked questions about the PSM and debt repayment process
 ** Helps users understand the system and common operations
 ************************************************************************************************/
export default function FAQCard(): ReactNode {
	return (
		<Card className={'border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
			<div className={'space-y-6'}>
				<h3 className={'text-xl font-semibold text-white'}>{'FAQ'}</h3>
				<Accordion
					type={'single'}
					collapsible
					className={'w-full'}>
					{FAQ_ITEMS.map(({question, answer}, index) => (
						<AccordionItem
							key={index}
							value={`faq-${index}`}>
							<AccordionTrigger
								className={'text-sm font-medium text-white hover:text-[#0657F9] hover:no-underline'}>
								{question}
							</AccordionTrigger>
							<AccordionContent className={'text-sm text-gray-400'}>{answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</div>
		</Card>
	);
}
