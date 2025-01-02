import {mainnet} from 'viem/chains';

import type {Address} from 'viem';

export const CHAIN_ID = mainnet.id;

export const ADDRESSES: {[key: string]: {troveHelper: Address; psm: Address}} = {
	mkUSD: {
		troveHelper: '0xc9C2D0bFb9860AD89a91D2069A8d73A6f903e9C4',
		psm: '0x9d7634b2B99c2684611c0Ac3150bAF6AEEa4Ed77'
	},
	ULTRA: {
		troveHelper: '0x4404ff820dad76afc4f931079eb13fd418c9ae7a',
		psm: '0xAe21Fe5B61998b143f721CE343aa650a6d5EadCe'
	}
};

export const PSM_ADDRESSES: {[key: string]: Address} = {
	mkUSD: '0x9d7634b2B99c2684611c0Ac3150bAF6AEEa4Ed77',
	ULTRA: '0xAe21Fe5B61998b143f721CE343aa650a6d5EadCe'
};

export const TOKENS: {[key: string]: Address} = {
	mkUSD: '0x4591DBfF62656E7859Afe5e45f6f47D3669fBB28',
	ULTRA: '0x35282d87011f87508D457F08252Bc5bFa52E10A0',
	crvUSD: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'
};

export const BORROWER_OPS_ADDRESSES: {[key: string]: Address} = {
	mkUSD: '0x72c590349535AD52e6953744cb2A36B409542719',
	ULTRA: '0xeCabcF7d41Ca644f87B25704cF77E3011D9a70a1'
};
