import type {Address} from 'viem';

export const CHAIN_ID = 69;

export const ADDRESSES: {[key: string]: {troveHelper: Address; psm: Address}} = {
	mkUSD: {
		troveHelper: '0xc9C2D0bFb9860AD89a91D2069A8d73A6f903e9C4',
		psm: '0xe3c77ec951bb8c19386a28c5bdf99d7750bd59f5'
	},
	ULTRA: {
		troveHelper: '0x4404ff820dad76afc4f931079eb13fd418c9ae7a',
		psm: '0xa978891e9d8fe36838891ba9e2ae77727ee63dc8'
	}
};

export const PSM_ADDRESSES: {[key: string]: Address} = {
	mkUSD: '0xe3c77ec951bb8c19386a28c5bdf99d7750bd59f5',
	ULTRA: '0xa978891e9d8fe36838891ba9e2ae77727ee63dc8'
};

export const TOKENS: {[key: string]: Address} = {
	mkUSD: '0x4591DBfF62656E7859Afe5e45f6f47D3669fBB28',
	ULTRA: '0x35282d87011f87508D457F08252Bc5bFa52E10A0',
	crvUSD: '0x95ECDC6caAf7E4805FCeF2679A92338351D24297'
};

export const BORROWER_OPS_ADDRESSES: {[key: string]: Address} = {
	mkUSD: '0x72c590349535AD52e6953744cb2A36B409542719',
	ULTRA: '0xeCabcF7d41Ca644f87B25704cF77E3011D9a70a1'
};
