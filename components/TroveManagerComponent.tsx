'use client';

import {useState, useEffect} from 'react';
import {useAccount, useReadContract, useWriteContract} from 'wagmi';
import {formatEther, Address} from 'viem';

const TROVE_HELPER_ABI = [
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'getActiveTroveManagersForAccount',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]'
			}
		],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const TROVE_MANAGER_ABI = [
	{
		inputs: [
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			}
		],
		name: 'getTroveCollAndDebt',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	}
] as const;

const PSM_ABI = [
	{
		inputs: [
			{
				internalType: 'address',
				name: 'troveManager',
				type: 'address'
			},
			{
				internalType: 'address',
				name: 'account',
				type: 'address'
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256'
			},
			{
				internalType: 'address',
				name: 'upperHint',
				type: 'address'
			},
			{
				internalType: 'address',
				name: 'lowerHint',
				type: 'address'
			}
		],
		name: 'repayDebt',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

const ADDRESSES: Record<string, {troveHelper: Address; psm: Address}> = {
	mkUSD: {
		troveHelper: '0xc9C2D0bFb9860AD89a91D2069A8d73A6f903e9C4',
		psm: '0xe3c77ec951bb8c19386a28c5bdf99d7750bd59f5'
	},
	ULTRA: {
		troveHelper: '0x4404ff820dad76afc4f931079eb13fd418c9ae7a',
		psm: '0xa978891e9d8fe36838891ba9e2ae77727ee63dc8'
	}
};

export default function TroveManagerComponent({stablecoin}: {stablecoin: 'mkUSD' | 'ULTRA'}) {
	const {address} = useAccount();
	const [troveManagers, setTroveManagers] = useState<Address[]>([]);

	const {data: activeTroveManagers} = useReadContract({
		address: ADDRESSES[stablecoin].troveHelper,
		abi: TROVE_HELPER_ABI,
		functionName: 'getActiveTroveManagersForAccount',
		args: [address!],
		query: {enabled: !!address}
	});

	useEffect(() => {
		if (activeTroveManagers) {
			setTroveManagers(activeTroveManagers as Address[]);
		}
	}, [activeTroveManagers]);

	return (
		<div className="mt-8 p-6 border rounded-lg">
			<h2 className="text-2xl font-bold mb-4">Your {stablecoin} Troves</h2>
			{troveManagers.map(troveManager => (
				<TroveDetails
					key={troveManager}
					troveManager={troveManager}
					stablecoin={stablecoin}
				/>
			))}
		</div>
	);
}

function TroveDetails({troveManager, stablecoin}: {troveManager: Address; stablecoin: 'mkUSD' | 'ULTRA'}) {
	const {address} = useAccount();
	const {writeContract} = useWriteContract();

	const {data: troveData} = useReadContract({
		address: troveManager,
		abi: TROVE_MANAGER_ABI,
		functionName: 'getTroveCollAndDebt',
		args: [address!],
		query: {enabled: !!address}
	});

	const [coll, debt] = (troveData || [BigInt(0), BigInt(0)]) as [bigint, bigint];

	const handleRepayDebt = async () => {
		if (!address) return;

		await writeContract({
			address: ADDRESSES[stablecoin].psm,
			abi: PSM_ABI,
			functionName: 'repayDebt',
			args: [
				troveManager,
				address,
				debt,
				'0x0000000000000000000000000000000000000000',
				'0x0000000000000000000000000000000000000000'
			]
		});
	};

	if (debt === BigInt(0)) return null;

	return (
		<div className="mt-4 p-4 border rounded">
			<p>Trove Manager: {troveManager}</p>
			<p>Collateral: {formatEther(coll)} ETH</p>
			<p>
				Debt: {formatEther(debt)} {stablecoin}
			</p>
			<button
				onClick={handleRepayDebt}
				className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
				Repay Debt
			</button>
		</div>
	);
}
