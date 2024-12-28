'use client';

import Image from 'next/image';
import {ConnectKitButton} from 'connectkit';
import {useAccount} from 'wagmi';

import type {ReactNode} from 'react';

import DebtRepaymentCard from '@/components/DebtRepaymentCard';
import FAQCard from '@/components/FAQCard';
import {Card} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';

/************************************************************************************************
 ** Custom Connect Button Component
 ** Handles loading state and displays wallet info when connected
 ************************************************************************************************/
function CustomConnectButton(): ReactNode {
	return (
		<ConnectKitButton.Custom>
			{({isConnected, isConnecting, show, address, ensName}) => {
				if (isConnecting) {
					return (
						<div className={'animate-pulse'}>
							<div className={'h-10 w-[140px] rounded-md bg-[#2D2D2D]'} />
						</div>
					);
				}

				return (
					<button
						onClick={show}
						className={
							'inline-flex h-10 items-center justify-center rounded-md bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2D2D2D]'
						}>
						{isConnected
							? (ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`)
							: 'Connect Wallet'}
					</button>
				);
			}}
		</ConnectKitButton.Custom>
	);
}

/************************************************************************************************
 ** Home Component
 ** Main page component that handles the PSM interface and debt repayment functionality
 ** Includes wallet connection, stablecoin selection, and debt management features
 ************************************************************************************************/
export default function Home(): ReactNode {
	const {isConnected} = useAccount();

	return (
		<div className={'min-h-screen bg-[#0E0E0E]'}>
			{/* Header - h-[72px] defines fixed header height */}
			<header
				className={
					'fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#2D2D2D] bg-[#0E0E0E]/80 backdrop-blur'
				}>
				<div className={'mx-auto flex h-full max-w-7xl items-center justify-between p-4'}>
					<div className={'flex items-center'}>
						<Image
							src={'/prisma-logo.svg'}
							alt={'Prisma PSM'}
							width={32}
							height={32}
							className={'mr-2'}
						/>
						<span className={'text-lg font-semibold text-white'}>{'Prisma PSM'}</span>
					</div>
					<CustomConnectButton />
				</div>
			</header>

			{/* Main Content - pt-[72px] matches header height */}
			<main className={'mx-auto max-w-7xl px-4 pt-[72px]'}>
				<div className={'py-8'}>
					<div className={'mx-auto max-w-2xl'}>
						<Tabs
							defaultValue={'mkUSD'}
							className={'w-full'}>
							<TabsList className={'grid w-full grid-cols-2'}>
								<TabsTrigger value={'mkUSD'}>{'mkUSD'}</TabsTrigger>
								<TabsTrigger value={'ULTRA'}>{'ULTRA'}</TabsTrigger>
							</TabsList>

							<TabsContent value={'mkUSD'}>
								<div className={'space-y-4'}>
									{isConnected ? (
										<DebtRepaymentCard stablecoin={'mkUSD'} />
									) : (
										<Card
											className={
												'flex min-h-[200px] items-center justify-center border-[#2D2D2D] bg-[#1A1A1A] p-6'
											}>
											<p className={'text-gray-400'}>
												{'Please connect your wallet to continue'}
											</p>
										</Card>
									)}
									<FAQCard />
								</div>
							</TabsContent>

							<TabsContent value={'ULTRA'}>
								<div className={'space-y-4'}>
									{isConnected ? (
										<DebtRepaymentCard stablecoin={'ULTRA'} />
									) : (
										<Card
											className={
												'flex min-h-[200px] items-center justify-center border-[#2D2D2D] bg-[#1A1A1A] p-6'
											}>
											<p className={'text-gray-400'}>
												{'Please connect your wallet to continue'}
											</p>
										</Card>
									)}
									<FAQCard />
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</main>
		</div>
	);
}
