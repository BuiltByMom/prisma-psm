'use client';

import {http} from '@wagmi/core';
import {cookieStorage, createConfig, createStorage} from 'wagmi';
import {WagmiAdapter} from '@reown/appkit-adapter-wagmi';
import {Chain, mainnet} from 'wagmi/chains';
import {ConnectKitProvider} from 'connectkit';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState, type ReactNode} from 'react';
import {WagmiProvider, type Config} from 'wagmi';

const tenderlyFork = {
	...mainnet,
	id: 69,
	name: 'Tenderly Fork',
	network: 'tenderly',
	rpcUrls: {
		default: {
			http: ['https://virtual.mainnet.rpc.tenderly.co/ea8d195f-b5be-4081-8e55-32c288a0a347']
		},
		public: {
			http: ['https://virtual.mainnet.rpc.tenderly.co/ea8d195f-b5be-4081-8e55-32c288a0a347']
		}
	}
};

// 1. Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!;

// 2. Networks networks
export const defaultNetwork = tenderlyFork;
export const networks: [Chain, ...Chain[]] = [tenderlyFork];

// 3. Transports
// TODO: Add BNS to berachain testnet when https://github.com/wevm/viem/pull/3101 is merged
const transports = {
	[tenderlyFork.id]: http()
};

const storage = createStorage({storage: cookieStorage});
// Create wagmi config - if needed
export const wagmiConfig = createConfig({
	storage,
	chains: networks,
	transports,
	ssr: true
});

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
	storage: {
		key: storage.key,
		getItem: storage.getItem,
		setItem: storage.setItem,
		removeItem: storage.removeItem
	},
	ssr: true,
	projectId,
	networks
});

interface WagmiProviderProps {
	children: ReactNode;
}

function WagmiContextProvider({children}: WagmiProviderProps) {
	const [config] = useState(wagmiAdapter.wagmiConfig as Config);
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<ConnectKitProvider>{children}</ConnectKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}

export default WagmiContextProvider;
