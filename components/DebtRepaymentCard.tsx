'use client';

import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {toast} from 'sonner';
import {erc20Abi, formatEther, parseEther, zeroAddress} from 'viem';
import {useAccount, useBlockNumber, useConfig, useReadContract, useSwitchChain, useWriteContract} from 'wagmi';
import {waitForTransactionReceipt} from '@wagmi/core';

import type {ReactNode} from 'react';
import type {Address} from 'viem';

import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ADDRESSES, BORROWER_OPS_ADDRESSES, CHAIN_ID, TOKENS} from '@/lib/constants';
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
		inputs: [
			{internalType: 'address', name: 'owner', type: 'address'},
			{internalType: 'address', name: 'delegate', type: 'address'}
		],
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
			{
				internalType: 'address',
				name: '_troveManager',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_account',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256'
			},
			{
				internalType: 'address',
				name: '_upperHint',
				type: 'address'
			},
			{
				internalType: 'address',
				name: '_lowerHint',
				type: 'address'
			}
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
	const config = useConfig();

	const [amount, set_amount] = useState('');
	const [troveManagers, set_troveManagers] = useState<Address[]>([]);
	const [selectedTrove, set_selectedTrove] = useState<Address | null>(null);
	const [isApprovedDelegate, set_isApprovedDelegate] = useState(false);
	const [isApprovedCrvUSD, set_isApprovedCrvUSD] = useState(false);

	const {data: blockNumber} = useBlockNumber({chainId: CHAIN_ID, watch: true});

	// Get active trove managers
	const {
		data: activeTroveManagers,
		isPending: isLoadingTroves,
		refetch: refetchTroveManagers
	} = useReadContract({
		address: ADDRESSES[stablecoin].troveHelper,
		abi: TROVE_HELPER_ABI,
		chainId: CHAIN_ID,
		functionName: 'getActiveTroveManagersForAccount',
		args: [address!],
		query: {enabled: !!address}
	});

	// Check if PSM is approved delegate using borrowerOps from PSM
	const {data: isDelegateApproved, refetch: refetchIsDelegateApproved} = useReadContract({
		address: BORROWER_OPS_ADDRESSES[stablecoin],
		abi: BORROWER_OPS_ABI,
		chainId: CHAIN_ID,
		functionName: 'isApprovedDelegate',
		args: [address!, ADDRESSES[stablecoin].psm],
		query: {enabled: !!BORROWER_OPS_ADDRESSES[stablecoin] && !!address}
	});

	// Check if crvUSD is approved delegate using borrowerOps from PSM
	const {data: isCrvUSDApproved, refetch: refetchIsCrvUSDApproved} = useReadContract({
		address: TOKENS['crvUSD'],
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'allowance',
		args: [address!, ADDRESSES[stablecoin].psm],
		query: {enabled: !!address}
	});

	// Get trove debt
	const {
		data: troveData,
		isLoading: isLoadingDebt,
		refetch: refetchTroveData
	} = useReadContract({
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

	// Get user's crvUSD balance
	const {
		data: userCrvUSDBalance,
		isPending: isLoadingUserCrvUSD,
		refetch: refetchUserCrvUSDBalance
	} = useReadContract({
		address: TOKENS.crvUSD,
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'balanceOf',
		args: [address!],
		query: {enabled: !!address}
	});

	// Update refetch function to include crvUSD balance
	const refetchAll = useCallback(async () => {
		await Promise.all([
			refetchTroveManagers(),
			refetchIsDelegateApproved(),
			refetchIsCrvUSDApproved(),
			refetchUserCrvUSDBalance(),
			refetchTroveData()
		]);
	}, [
		refetchTroveManagers,
		refetchIsDelegateApproved,
		refetchIsCrvUSDApproved,
		refetchTroveData,
		refetchUserCrvUSDBalance
	]);

	useEffect(() => {
		refetchAll();
	}, [blockNumber, refetchAll]);

	useEffect(() => {
		if (activeTroveManagers) {
			set_troveManagers(activeTroveManagers as Address[]);
			if (activeTroveManagers.length > 0) {
				set_selectedTrove(activeTroveManagers[0]);
			}
		}
	}, [activeTroveManagers]);

	useEffect(() => {
		set_isApprovedDelegate(!!isDelegateApproved);
	}, [isDelegateApproved]);

	useEffect(() => {
		if (!isCrvUSDApproved) {
			set_isApprovedCrvUSD(false);
			return;
		}
		set_isApprovedCrvUSD(parseEther(amount) <= isCrvUSDApproved);
	}, [amount, isCrvUSDApproved]);

	// Helper function to check if amount is approximately equal to debt (within buffer)
	const isApproximatelyDebt = useCallback(
		(inputAmount: bigint) => {
			const buffer = (debt * BigInt(DEBT_BUFFER_BPS)) / BigInt(10000); // Convert BPS to percentage
			return inputAmount >= debt - buffer && inputAmount <= debt + buffer;
		},
		[debt]
	);

	// Update max amount handler
	const handleSetMaxAmount = useCallback(() => {
		if (!debt || !userCrvUSDBalance) {
			return;
		}
		const maxAmount = userCrvUSDBalance < debt ? userCrvUSDBalance : debt;
		set_amount(formatEther(maxAmount));
	}, [debt, userCrvUSDBalance]);

	const handleAction = useCallback(async () => {
		if (!isApprovedCrvUSD) {
			try {
				if (chain?.id !== CHAIN_ID) {
					await switchChainAsync({chainId: CHAIN_ID});
				}

				const txPromise = toast.promise(
					(async () => {
						try {
							const tx = await writeContractAsync({
								address: TOKENS['crvUSD'],
								abi: erc20Abi,
								chainId: CHAIN_ID,
								functionName: 'approve',
								args: [ADDRESSES[stablecoin].psm, MAX_UINT256]
							});

							const receipt = await waitForTransactionReceipt(config, {hash: tx});
							if (receipt.status === 'success') {
								refetchIsCrvUSDApproved();
							}
							return receipt;
						} catch (error) {
							console.error(error);
							const errorMessage = (error as unknown as {shortMessage: string}).shortMessage;
							throw errorMessage;
						}
					})(),
					{
						loading: 'Approving crvUSD...',
						success: 'crvUSD approved successfully',
						error: errorMessage => `Failed to approve crvUSD: ${errorMessage}`
					}
				);

				await txPromise;
				refetchIsDelegateApproved();
			} catch (error) {
				console.error(error);
			}
		} else if (!isApprovedDelegate) {
			if (!BORROWER_OPS_ADDRESSES[stablecoin]) {
				return;
			}

			try {
				if (chain?.id !== CHAIN_ID) {
					await switchChainAsync({chainId: CHAIN_ID});
				}

				const txPromise = toast.promise(
					(async () => {
						try {
							const tx = await writeContractAsync({
								address: BORROWER_OPS_ADDRESSES[stablecoin],
								abi: BORROWER_OPS_ABI,
								chainId: CHAIN_ID,
								functionName: 'setDelegateApproval',
								args: [ADDRESSES[stablecoin].psm, true]
							});

							const receipt = await waitForTransactionReceipt(config, {hash: tx});
							if (receipt.status === 'success') {
								refetchIsDelegateApproved();
							}
							return receipt;
						} catch (error) {
							console.error(error);
							const errorMessage = (error as unknown as {shortMessage: string}).shortMessage;
							throw errorMessage;
						}
					})(),
					{
						loading: 'Approving PSM...',
						success: 'PSM approved successfully',
						error: errorMessage => `Failed to approve PSM: ${errorMessage}`
					}
				);

				await txPromise;
				refetchIsDelegateApproved();
			} catch (error) {
				console.error(error);
			}
		} else {
			if (!selectedTrove || !address || !amount) {
				return;
			}

			try {
				if (chain?.id !== CHAIN_ID) {
					await switchChainAsync({chainId: CHAIN_ID});
				}

				const repayAmount = isApproximatelyDebt(parseEther(amount)) ? MAX_UINT256 : parseEther(amount);
				const txPromise = toast.promise(
					(async () => {
						try {
							const tx = await writeContractAsync({
								address: ADDRESSES[stablecoin].psm,
								abi: PSM_ABI,
								chainId: CHAIN_ID,
								functionName: 'repayDebt',
								args: [selectedTrove, address, repayAmount, zeroAddress, zeroAddress]
							});

							const receipt = await waitForTransactionReceipt(config, {hash: tx, confirmations: 1});
							if (receipt.status === 'success') {
								refetchIsDelegateApproved();
							}
							return receipt;
						} catch (error) {
							console.error(error);
							const errorMessage = (error as unknown as {shortMessage: string}).shortMessage;
							throw errorMessage;
						}
					})(),
					{
						loading: 'Repaying debt...',
						success: `Successfully repaid ${amount} ${stablecoin}`,
						error: errorMessage => `Failed to repay debt: ${errorMessage}`
					}
				);

				await txPromise;
				await refetchAll();
			} catch (error) {
				console.error(error);
			}
		}
	}, [
		address,
		amount,
		chain?.id,
		config,
		isApprovedCrvUSD,
		isApprovedDelegate,
		isApproximatelyDebt,
		refetchIsCrvUSDApproved,
		refetchIsDelegateApproved,
		refetchAll,
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
						<span className={'text-sm text-gray-400'}>{'Your crvUSD Balance'}</span>
						<span className={'text-sm text-white'}>
							{isLoadingUserCrvUSD ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								`${formatNumber({value: userCrvUSDBalance || BigInt(0)})} crvUSD`
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

				<div className={'space-y-4'}>
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
							onClick={handleSetMaxAmount}
							className={'bg-[#1E1E1E] hover:bg-[#2D2D2D]'}
							disabled={isLoadingDebt || !userCrvUSDBalance}>
							{'Max'}
						</Button>
					</div>

					<Button
						className={'w-full bg-[#0657F9] hover:bg-[#0444c9]'}
						onClick={handleAction}
						disabled={
							isLoadingDebt ||
							(!isApprovedCrvUSD
								? debt === BigInt(0)
								: !isApprovedDelegate
									? debt === BigInt(0)
									: !amount ||
										(parseEther(amount) > debt && !isApproximatelyDebt(parseEther(amount))) ||
										debt === BigInt(0))
						}>
						{!isApprovedCrvUSD ? 'Approve crvUSD' : !isApprovedDelegate ? 'Approve PSM' : 'Repay Debt'}
					</Button>
				</div>
			</div>
		</Card>
	);
}
