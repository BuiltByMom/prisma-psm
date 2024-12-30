import {Inter} from 'next/font/google';
import {Toaster} from 'sonner';

import type {ReactNode} from 'react';

import '@/app/globals.css';

import WagmiContextProvider from '@/components/providers';

const inter = Inter({subsets: ['latin']});

export default async function RootLayout({children}: {children: ReactNode}): Promise<ReactNode> {
	return (
		<html
			lang={'en'}
			className={'dark'}
			suppressHydrationWarning>
			<body className={`${inter.className} min-h-screen bg-[#0E0E0E] text-white`}>
				<WagmiContextProvider>{children}</WagmiContextProvider>
				<Toaster
					position={'bottom-right'}
					theme={'dark'}
					richColors
				/>
			</body>
		</html>
	);
}
