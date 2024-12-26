'use client';

import {useState, useCallback} from 'react';
import {useReadContract, useWriteContract} from 'wagmi';
import {parseEther, formatEther, Address} from 'viem';

const PSM_ABI = [
	{
		inputs: [],
		name: 'getReserves',
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
	},
	{
		inputs: [],
		name: 'rate',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
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
];

const PSM_ADDRESSES: Record<string, Address> = {
	mkUSD: '0xe3c77ec951bb8c19386a28c5bdf99d7750bd59f5',
	ULTRA: '0xa978891e9d8fe36838891ba9e2ae77727ee63dc8'
};

export default function PSMComponent({stablecoin}: {stablecoin: 'mkUSD' | 'ULTRA'}) {
	const {writeContract} = useWriteContract();
	const [sellAmount, setSellAmount] = useState('');

	const {data: reserves} = useReadContract({
		address: PSM_ADDRESSES[stablecoin],
		abi: PSM_ABI,
		functionName: 'getReserves'
	});

	const {data: rateData} = useReadContract({
		address: PSM_ADDRESSES[stablecoin],
		abi: PSM_ABI,
		functionName: 'rate'
	});

	const sellDebtToken = useCallback(async () => {
		const result = await writeContract({
			address: PSM_ADDRESSES[stablecoin],
			abi: PSM_ABI,
			functionName: 'sellDebtToken',
			args: [parseEther(sellAmount || '0')]
		});
		return result;
	}, [writeContract, stablecoin, sellAmount]);

	const [debtTokenAvailable, crvUsdAvailable] = (reserves || [BigInt(0), BigInt(0)]) as [bigint, bigint];
	const rate = rateData ? (Number(rateData) * 60 * 60 * 24) / 1e18 : 0;

	return (
		<div className="mt-8 p-6 border rounded-lg">
			<h2 className="text-2xl font-bold mb-4">{stablecoin} PSM</h2>
			<p>
				{stablecoin} Available: {formatEther(debtTokenAvailable)} {stablecoin}
			</p>
			<p>crvUSD Available: {formatEther(crvUsdAvailable)} crvUSD</p>
			<p>
				Rate: {rate.toFixed(2)} {stablecoin}/day
			</p>
			<div className="mt-4">
				<input
					type="number"
					value={sellAmount}
					onChange={e => setSellAmount(e.target.value)}
					placeholder={`Amount of ${stablecoin} to sell`}
					className="p-2 border rounded text-black"
				/>
				<button
					onClick={() => sellDebtToken?.()}
					className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
					Sell {stablecoin}
				</button>
			</div>
		</div>
	);
}
