export interface Asset {
  id: number;
  rank: number;
  name: string;
  tier: 'immortal' | 'elite' | 'founders';
  floor: number;
  lastSale: number;
  volume: number;
  change: number;
  listed: string;
  owner: string;
  status: 'listed' | 'owned' | 'auction';
  bids: { bidder: string; amount: number; time: string }[];
}

export const FULL_ASSET_LIST: Asset[] = [
  {
    id: 1,
    rank: 1,
    name: "VIVI",
    tier: 'immortal',
    floor: 50,
    lastSale: 45,
    volume: 1200,
    change: 12,
    listed: "Active",
    owner: "0xf65BF669EE7775C9788ed367742e1527D0118B58",
    status: 'owned',
    bids: []
  }
];

export const getAssetById = (id: number) => {
    return FULL_ASSET_LIST.find(a => a.id === id);
};
