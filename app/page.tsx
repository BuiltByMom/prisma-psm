'use client';

import {useState} from 'react';
import {ConnectKitButton} from 'connectkit';
import {useAccount} from 'wagmi';
import PSMComponent from '@/components/PSMComponent';
import TroveManagerComponent from '@/components/TroveManagerComponent';

export default function Home() {
	const [selectedStablecoin, setSelectedStablecoin] = useState<'mkUSD' | 'ULTRA'>('mkUSD');
	const {isConnected} = useAccount();

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<h1 className="text-4xl font-bold mb-8">Prisma PSM</h1>
			<ConnectKitButton />
			{isConnected && (
				<>
					<div className="mt-8 mb-4">
						<button
							className={`px-4 py-2 rounded-l-md ${
								selectedStablecoin === 'mkUSD' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
							}`}
							onClick={() => setSelectedStablecoin('mkUSD')}>
							mkUSD
						</button>
						<button
							className={`px-4 py-2 rounded-r-md ${
								selectedStablecoin === 'ULTRA' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
							}`}
							onClick={() => setSelectedStablecoin('ULTRA')}>
							ULTRA
						</button>
					</div>
					<PSMComponent stablecoin={selectedStablecoin} />
					<TroveManagerComponent stablecoin={selectedStablecoin} />
				</>
			)}
		</main>
	);
}
