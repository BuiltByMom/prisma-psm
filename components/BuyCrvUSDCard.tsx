'use client';

import {useCallback, useState} from 'react';
import {erc20Abi, formatEther, parseEther} from 'viem';
import {useAccount, useReadContract, useSwitchChain, useWriteContract} from 'wagmi';

import type {ReactNode} from 'react';

import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {ADDRESSES, CHAIN_ID, TOKENS} from '@/lib/constants';
import {formatNumber} from '@/lib/utils';

const PSM_ABI = [
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256'
			}
		],
		name: 'sellDebtToken',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

type TBuyCrvUSDCardProps = {
	stablecoin: 'mkUSD' | 'ULTRA';
};

/************************************************************************************************
 ** BuyCrvUSDCard Component
 ** Allows users to purchase crvUSD using mkUSD or ULTRA tokens
 ** Displays available PSM balance and user balances
 ************************************************************************************************/
export default function BuyCrvUSDCard({stablecoin}: TBuyCrvUSDCardProps): ReactNode {
	const {address} = useAccount();
	const {switchChainAsync, data: chain} = useSwitchChain();
	const {writeContractAsync} = useWriteContract();
	const [buyAmount, set_buyAmount] = useState('');

	// Get PSM's crvUSD balance
	const {data: psmCrvUSDBalance, isPending: isLoadingPSMBalance} = useReadContract({
		address: TOKENS.crvUSD,
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'balanceOf',
		args: [ADDRESSES[stablecoin].psm]
	});

	// Get user's crvUSD balance
	const {data: userCrvUSDBalance, isPending: isLoadingUserCrvUSD} = useReadContract({
		address: TOKENS.crvUSD,
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'balanceOf',
		args: [address!],
		query: {enabled: !!address}
	});

	// Get user's debt token balance (mkUSD/ULTRA)
	const {data: userDebtTokenBalance, isPending: isLoadingUserDebt} = useReadContract({
		address: ADDRESSES[stablecoin].psm,
		abi: erc20Abi,
		chainId: CHAIN_ID,
		functionName: 'balanceOf',
		args: [address!],
		query: {enabled: !!address}
	});

	const handleBuyCrvUSD = useCallback(async () => {
		if (!buyAmount) {
			return;
		}

		if (chain?.id !== CHAIN_ID) {
			await switchChainAsync({chainId: CHAIN_ID});
		}
		await writeContractAsync({
			address: ADDRESSES[stablecoin].psm,
			abi: PSM_ABI,
			chainId: CHAIN_ID,
			functionName: 'sellDebtToken',
			args: [parseEther(buyAmount)]
		});
	}, [buyAmount, chain?.id, stablecoin, switchChainAsync, writeContractAsync]);

	return (
		<Card className={'border-[#2D2D2D] bg-[#1A1A1A] p-6'}>
			<div className={'space-y-4'}>
				<div className={'flex items-center justify-between'}>
					<h3 className={'text-xl font-semibold text-white'}>{'Buy crvUSD'}</h3>
				</div>

				<div className={'space-y-2 rounded-md border border-[#2D2D2D] bg-[#1E1E1E] p-3'}>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{'Available crvUSD'}</span>
						<span className={'text-sm text-white'}>
							{isLoadingPSMBalance ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								`${formatNumber({value: psmCrvUSDBalance || 0})} crvUSD`
							)}
						</span>
					</div>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{'Your crvUSD Balance'}</span>
						<span className={'text-sm text-white'}>
							{isLoadingUserCrvUSD ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								`${formatNumber({value: userCrvUSDBalance || BigInt(0)})}`
							)}
						</span>
					</div>
					<div className={'flex items-center justify-between'}>
						<span className={'text-sm text-gray-400'}>{`Your ${stablecoin} Balance`}</span>
						<span className={'text-sm text-white'}>
							{isLoadingUserDebt ? (
								<span className={'inline-block h-4 w-16 animate-pulse rounded bg-[#2D2D2D]'} />
							) : (
								`${formatNumber({value: userDebtTokenBalance || BigInt(0)})} ${stablecoin}`
							)}
						</span>
					</div>
				</div>

				<div className={'space-y-2'}>
					<div className={'flex items-center gap-2'}>
						<Input
							type={'number'}
							placeholder={`Amount of ${stablecoin} to spend`}
							value={buyAmount}
							onChange={e => set_buyAmount(e.target.value)}
							className={'border-[#2D2D2D] bg-[#1A1A1A]'}
						/>
						<Button
							variant={'secondary'}
							onClick={() => set_buyAmount(formatEther(userDebtTokenBalance || BigInt(0)))}
							className={'bg-[#1E1E1E] hover:bg-[#2D2D2D]'}
							disabled={!userDebtTokenBalance}>
							{'Max'}
						</Button>
					</div>

					<Button
						className={'w-full bg-[#0657F9] hover:bg-[#0444c9]'}
						onClick={handleBuyCrvUSD}
						disabled={
							!buyAmount ||
							!userDebtTokenBalance ||
							parseEther(buyAmount) > userDebtTokenBalance ||
							parseEther(buyAmount) > (psmCrvUSDBalance || 0)
						}>
						{`Buy crvUSD with ${stablecoin}`}
					</Button>
				</div>
			</div>
		</Card>
	);
}
