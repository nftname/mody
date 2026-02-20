
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const useNonEVMPayment = () => {
  const processNonEVMPayment = async (coin: string, address: string, amount: string) => {
    const lowerCoin = coin.toLowerCase();

    if (lowerCoin === 'btc') {
      if (typeof window !== 'undefined' && (window as any).unisat) {
        await (window as any).unisat.requestAccounts();
        const satoshis = Math.floor(parseFloat(amount) * 100000000);
        return await (window as any).unisat.sendBitcoin(address, satoshis);
      } else {
        await navigator.clipboard.writeText(address);
        alert(`Unisat wallet not found. The Bitcoin address ${address} has been copied to your clipboard.`);
        return true;
      }
    }

    if (lowerCoin === 'sol') {
      if (typeof window !== 'undefined' && (window as any).solana) {
        const provider = (window as any).solana;
        await provider.connect();
        
        const connection = new Connection("https://solana-rpc.publicnode.com");
        const fromPubkey = provider.publicKey;
        const toPubkey = new PublicKey(address);
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );
        
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;
        
        const { signature } = await provider.signAndSendTransaction(transaction);
        return signature;
      } else {
        await navigator.clipboard.writeText(address);
        alert(`Phantom wallet not found. The Solana address ${address} has been copied to your clipboard.`);
        return true;
      }
    }

    return null;
  };

  return { processNonEVMPayment };
};
