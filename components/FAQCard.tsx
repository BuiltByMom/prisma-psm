'use client';

import Link from 'next/link';

import type {ReactNode} from 'react';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Card} from '@/components/ui/card';
import {BORROWER_OPS_ADDRESSES, PSM_ADDRESSES, TOKENS} from '@/lib/constants';

type TFAQItem = {
	question: string;
	answer: string | ReactNode;
};

const FAQ_ITEMS: TFAQItem[] = [
	{
		question: 'Contract Addresses',
		answer: (
			<div className={'space-y-4'}>
				<div>
					<h4 className={'mb-2 font-medium text-white'}>{'PSM Contracts'}</h4>
					<div className={'space-y-1'}>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'mkUSD PSM:'}</span>
							<Link
								href={`https://etherscan.io/address/${PSM_ADDRESSES.mkUSD}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{PSM_ADDRESSES.mkUSD}
							</Link>
						</div>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'ULTRA PSM:'}</span>
							<Link
								href={`https://etherscan.io/address/${PSM_ADDRESSES.ULTRA}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{PSM_ADDRESSES.ULTRA}
							</Link>
						</div>
					</div>
				</div>

				<div>
					<h4 className={'mb-2 font-medium text-white'}>{'Borrower Operations'}</h4>
					<div className={'space-y-1'}>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'mkUSD:'}</span>
							<Link
								href={`https://etherscan.io/address/${BORROWER_OPS_ADDRESSES.mkUSD}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{BORROWER_OPS_ADDRESSES.mkUSD}
							</Link>
						</div>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'ULTRA:'}</span>
							<Link
								href={`https://etherscan.io/address/${BORROWER_OPS_ADDRESSES.ULTRA}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{BORROWER_OPS_ADDRESSES.ULTRA}
							</Link>
						</div>
					</div>
				</div>

				<div>
					<h4 className={'mb-2 font-medium text-white'}>{'Tokens'}</h4>
					<div className={'space-y-1'}>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'mkUSD:'}</span>
							<Link
								href={`https://etherscan.io/address/${TOKENS.mkUSD}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{TOKENS.mkUSD}
							</Link>
						</div>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'ULTRA:'}</span>
							<Link
								href={`https://etherscan.io/address/${TOKENS.ULTRA}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{TOKENS.ULTRA}
							</Link>
						</div>
						<div className={'flex items-center justify-between'}>
							<span className={'text-gray-400'}>{'crvUSD:'}</span>
							<Link
								href={`https://etherscan.io/address/${TOKENS.crvUSD}`}
								target={'_blank'}
								rel={'noopener noreferrer'}
								className={
									'font-mono text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
								}>
								{TOKENS.crvUSD}
							</Link>
						</div>
					</div>
				</div>
			</div>
		)
	},
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
