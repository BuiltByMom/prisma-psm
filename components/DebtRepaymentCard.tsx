'use client';

import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {erc20Abi, formatEther, parseEther} from 'viem';
import {useAccount, useReadContract, useSwitchChain, useWriteContract} from 'wagmi';

import type {ReactNode} from 'react';
import type {Address} from 'viem';

import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ADDRESSES, BORROWER_OPS_ADDRESSES, CHAIN_ID} from '@/lib/constants';
import {formatNumber} from '@/lib/utils';

const TROVE_HELPER_ABI = [
	{
		inputs: [{internalType: 'address', name: 'account', type: 'address'}],
		name: 'getActiveTroveManagersForAccount',
		outputs: [{internalType: 'address[]', name: '', type: 'address[]'}],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const TROVE_MANAGER_ABI = [
	{
		inputs: [{internalType: 'address', name: 'account', type: 'address'}],
		name: 'getTroveCollAndDebt',
		outputs: [
			{internalType: 'uint256', name: '', type: 'uint256'},
			{internalType: 'uint256', name: '', type: 'uint256'}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'collateralToken',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const BORROWER_OPS_ABI = [
	{
		inputs: [{internalType: 'address', name: 'delegate', type: 'address'}],
		name: 'isApprovedDelegate',
		outputs: [{internalType: 'bool', name: '', type: 'bool'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'delegate', type: 'address'},
			{internalType: 'bool', name: 'approved', type: 'bool'}
		],
		name: 'setDelegateApproval',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

const PSM_ABI = [
	{
		inputs: [],
		name: 'borrowerOps',
		outputs: [{internalType: 'address', name: '', type: 'address'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{internalType: 'address', name: 'troveManager', type: 'address'},
			{internalType: 'address', name: 'account', type: 'address'},
			{internalType: 'uint256', name: 'amount', type: 'uint256'},
			{internalType: 'address', name: 'upperHint', type: 'address'},
			{internalType: 'address', name: 'lowerHint', type: 'address'}
		],
		name: 'repayDebt',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'crvUSDBalance',
		outputs: [{internalType: 'uint256', name: '', type: 'uint256'}],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [{internalType: 'uint256', name: 'amount', type: 'uint256'}],
		name: 'buyCrvUSD',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

const EXPLORER_URL = 'https://etherscan.io/address/';

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

const DEBT_BUFFER_BPS = 50; // 0.5% = 50 basis points

type TDebtRepaymentCardProps = {
	stablecoin: 'mkUSD' | 'ULTRA';
};

/************************************************************************************************
 ** DebtRepaymentCard Component
 ** Displays debt information and repayment interface for a specific stablecoin
 ** Handles debt repayment transactions and approval flows
 ************************************************************************************************/
export default function DebtRepaymentCard({stablecoin}: TDebtRepaymentCardProps): ReactNode {
	const {address} = useAccount();
	const {writeContractAsync} = useWriteContract();
	const {switchChainAsync, data: chain} = useSwitchChain();
	const [amount, set_amount] = useState('');
	const [troveManagers, set_troveManagers] = useState<Address[]>([]);
	const [selectedTrove, set_selectedTrove] = useState<Address | null>(null);
	const [isApproved, set_isApproved] = useState(false);

	// Get active trove managers
	const {data: activeTroveManagers, isPending: isLoadingTroves} = useReadContract({
		address: ADDRESSES[stablecoin].troveHelper,
		abi: TROVE_HELPER_ABI,
		chainId: CHAIN_ID,
		functionName: 'getActiveTroveManagersForAccount',
		args: [address!],
		query: {enabled: !!address}
	});

	// Check if PSM is approved delegate using borrowerOps from PSM
	const {data: isDelegateApproved} = useReadContract({
		address: BORROWER_OPS_ADDRESSES[stablecoin],
		abi: BORROWER_OPS_ABI,
		chainId: CHAIN_ID,
		functionName: 'isApprovedDelegate',
		args: [ADDRESSES[stablecoin].psm],
		query: {enabled: !!BORROWER_OPS_ADDRESSES[stablecoin]}
	});

	// Get trove debt
	const {data: troveData, isLoading: isLoadingDebt} = useReadContract({
		address: selectedTrove!,
		abi: TROVE_MANAGER_ABI,
		chainId: CHAIN_ID,
		functionName: 'getTroveCollAndDebt',
		args: [address!],
		query: {enabled: !!selectedTrove && !!address}
	});

	// Get collateral token address
	const {data: collateralTokenAddress} = useReadContract({
		address: selectedTrove!,
		abi: TROVE_MANAGER_ABI,
		chainId: CHAIN_ID,
		functionName: 'collateralToken',
		query: {enabled: !!selectedTrove}
	});

	// Get collateral token name
	const {data: collateralName, isLoading: isLoadingCollateral} = useReadContract({
		address: collateralTokenAddress!,
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'name',
		query: {enabled: !!collateralTokenAddress}
	});

	const [, debt] = (troveData || [BigInt(0), BigInt(0)]) as [bigint, bigint];

	useEffect(() => {
		if (activeTroveManagers) {
			set_troveManagers(activeTroveManagers as Address[]);
			if (activeTroveManagers.length > 0) {
				set_selectedTrove(activeTroveManagers[0]);
			}
		}
	}, [activeTroveManagers]);

	useEffect(() => {
		set_isApproved(!!isDelegateApproved);
	}, [isDelegateApproved]);

	// Helper function to check if amount is approximately equal to debt (within buffer)
	const isApproximatelyDebt = useCallback(
		(inputAmount: bigint) => {
			const buffer = (debt * BigInt(DEBT_BUFFER_BPS)) / BigInt(10000); // Convert BPS to percentage
			return inputAmount >= debt - buffer && inputAmount <= debt + buffer;
		},
		[debt]
	);

	const handleApprove = useCallback(async () => {
		if (!BORROWER_OPS_ADDRESSES[stablecoin]) {
			return;
		}

		if (chain?.id !== CHAIN_ID) {
			await switchChainAsync({chainId: CHAIN_ID});
		}

		await writeContractAsync({
			address: BORROWER_OPS_ADDRESSES[stablecoin],
			abi: BORROWER_OPS_ABI,
			chainId: CHAIN_ID,
			functionName: 'setDelegateApproval',
			args: [ADDRESSES[stablecoin].psm, true]
		});
		set_isApproved(true);
	}, [chain?.id, stablecoin, switchChainAsync, writeContractAsync]);

	const handleRepayDebt = useCallback(async () => {
		if (!selectedTrove || !address) {
			return;
		}

		if (chain?.id !== CHAIN_ID) {
			await switchChainAsync({chainId: CHAIN_ID});
		}

		// Use MAX_UINT256 if amount is approximately equal to debt
		const repayAmount = isApproximatelyDebt(parseEther(amount)) ? MAX_UINT256 : parseEther(amount);

		await writeContractAsync({
			address: ADDRESSES[stablecoin].psm,
			abi: PSM_ABI,
			chainId: CHAIN_ID,
			functionName: 'repayDebt',
			args: [
				selectedTrove,
				address,
				repayAmount,
				'0x0000000000000000000000000000000000000000',
				'0x0000000000000000000000000000000000000000'
			]
		});
	}, [
		address,
		amount,
		chain?.id,
		isApproximatelyDebt,
		selectedTrove,
		stablecoin,
		switchChainAsync,
		writeContractAsync
	]);

	if (isLoadingTroves) {
		return (
			<Card className={'border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
				<div className={'space-y-4'}>
					<div className={'flex items-center justify-between'}>
						<div className={'h-7 w-32 animate-pulse rounded bg-[#2D2D2D]'} />
					</div>

					<div className={'space-y-2 rounded-md border border-[#2D2D2D] bg-[#1E1E1E] p-3'}>
						<div className={'flex items-center justify-between'}>
							<div className={'h-5 w-24 animate-pulse rounded bg-[#2D2D2D]'} />
							<div className={'h-5 w-32 animate-pulse rounded bg-[#2D2D2D]'} />
						</div>
						<div className={'flex items-center justify-between'}>
							<div className={'h-5 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							<div className={'h-5 w-20 animate-pulse rounded bg-[#2D2D2D]'} />
						</div>
						<div className={'flex items-center justify-between'}>
							<div className={'h-5 w-24 animate-pulse rounded bg-[#2D2D2D]'} />
							<div className={'h-5 w-28 animate-pulse rounded bg-[#2D2D2D]'} />
						</div>
					</div>

					<div className={'space-y-2'}>
						<div className={'flex items-center gap-2'}>
							<div className={'h-10 flex-1 animate-pulse rounded bg-[#2D2D2D]'} />
							<div className={'h-10 w-20 animate-pulse rounded bg-[#2D2D2D]'} />
						</div>
						<div className={'grid grid-cols-2 gap-2'}>
							<div className={'h-10 animate-pulse rounded bg-[#2D2D2D]'} />
							<div className={'h-10 animate-pulse rounded bg-[#2D2D2D]'} />
						</div>
					</div>
				</div>
			</Card>
		);
	}

	if (troveManagers.length === 0) {
		return (
			<Card className={'border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
				<p className={'text-center text-gray-400'}>{'No active troves found'}</p>
			</Card>
		);
	}

	return (
		<Card className={'border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
			<div className={'space-y-4'}>
				<div className={'flex items-center justify-between'}>
					<h3 className={'text-xl font-semibold text-white'}>
						{stablecoin}
						{' Debt'}
					</h3>
				</div>

				<div className={'space-y-2 rounded-md border border-[#2D2D2D] bg-[#1E1E1E] p-3'}>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{'Trove Manager'}</span>
						<Link
							href={EXPLORER_URL + selectedTrove}
							target={'_blank'}
							rel={'noopener noreferrer'}
							className={
								'font-mono text-sm text-white transition-colors hover:text-[#0657F9] active:text-[#0444c9]'
							}>
							<span className={'cursor-pointer'}>
								{selectedTrove?.slice(0, 6)}
								{'...'}
								{selectedTrove?.slice(-4)}
							</span>
						</Link>
					</div>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{'Collateral'}</span>
						<span className={'text-sm text-white'}>
							{isLoadingCollateral ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								collateralName
							)}
						</span>
					</div>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{'Current Debt'}</span>
						<span className={'text-sm text-white'}>
							{isLoadingDebt ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								`${formatNumber({value: debt})} ${stablecoin}`
							)}
						</span>
					</div>
				</div>

				{troveManagers.length > 1 && (
					<div className={'space-y-2'}>
						<label className={'text-sm text-gray-400'}>{'Select Trove'}</label>
						<select
							value={selectedTrove || ''}
							onChange={e => set_selectedTrove(e.target.value as Address)}
							className={'w-full rounded-md border border-[#2D2D2D] bg-[#1A1A1A] p-2 text-white'}
							disabled={isLoadingDebt}>
							{troveManagers.map(manager => (
								<option
									key={manager}
									value={manager}>
									{`${manager.slice(0, 6)}...${manager.slice(-4)}`}
								</option>
							))}
						</select>
					</div>
				)}

				<div className={'space-y-2'}>
					<div className={'flex items-center gap-2'}>
						<Input
							type={'number'}
							placeholder={'Amount to repay'}
							value={amount}
							onChange={e => set_amount(e.target.value)}
							className={'border-[#2D2D2D] bg-[#1A1A1A]'}
							disabled={isLoadingDebt}
						/>
						<Button
							variant={'secondary'}
							onClick={() => set_amount(formatEther(debt))}
							className={'bg-[#1E1E1E] hover:bg-[#2D2D2D]'}
							disabled={isLoadingDebt}>
							{'Max'}
						</Button>
					</div>

					<div className={'grid grid-cols-2 gap-2'}>
						<Button
							variant={'secondary'}
							onClick={handleApprove}
							disabled={isLoadingDebt || isApproved || debt === BigInt(0)}
							className={'bg-[#1E1E1E] hover:bg-[#2D2D2D]'}>
							{'Approve PSM'}
						</Button>
						<Button
							className={'bg-[#0657F9] hover:bg-[#0444c9]'}
							onClick={handleRepayDebt}
							disabled={
								isLoadingDebt ||
								!amount ||
								(parseEther(amount) > debt && !isApproximatelyDebt(parseEther(amount))) ||
								!isApproved ||
								debt === BigInt(0)
							}>
							{'Repay Debt'}
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
