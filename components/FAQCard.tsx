'use client';

import type {ReactNode} from 'react';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Card} from '@/components/ui/card';

type TFAQItem = {
	question: string;
	answer: string;
};

const FAQ_ITEMS: TFAQItem[] = [
	{
		question: 'What is Prisma PSM?',
		answer: 'Prisma PSM (Peg Stability Module) allows users to swap between stablecoins at a 1:1 ratio, helping maintain the peg of Prisma stablecoins.'
	},
	{
		question: 'How does debt repayment work?',
		answer: 'You can repay your debt by approving the PSM contract and then repaying your desired amount. The repayment will be processed at a 1:1 ratio.'
	},
	{
		question: 'Why do I need to approve first?',
		answer: 'Approval is a security feature of ERC20 tokens. It gives the PSM contract permission to use your tokens for debt repayment.'
	},
	{
		question: 'What happens after repayment?',
		answer: 'After repayment, your debt position will be reduced by the repaid amount. This will be reflected in your trove details.'
	}
];

/************************************************************************************************
 ** FAQCard Component
 ** Displays frequently asked questions about the PSM and debt repayment process
 ** Helps users understand the system and common operations
 ************************************************************************************************/
export default function FAQCard(): ReactNode {
	return (
		<Card className={'mt-4 border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
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
