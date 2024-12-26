import WagmiContextProvider from '@/components/providers';
import '@/app/globals.css';

export default async function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html
			lang="en"
			className="dark"
			suppressHydrationWarning>
			<body>
				<WagmiContextProvider>{children}</WagmiContextProvider>
			</body>
		</html>
	);
}
