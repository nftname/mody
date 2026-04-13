import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';

export const useMintPayment = () => {
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  const TREASURY = {
    SOL: "FL6oS9z5qJexHchisTzUD5xEuw8x5Mbf28c3dv7yPybt",
    USDT: "FL6oS9z5qJexHchisTzUD5xEuw8x5Mbf28c3dv7yPybt", 
    BTC: "bc1qfy4au2fq2az4v6a8gzteux4rqfd05mrgm273gx",
    EVM: "0x066Ff37dBf6847FE79AF29ff20585532185b6bDB"
  };

  const processPayment = async (coin: string, amount: string) => {
    const lowerCoin = coin.toLowerCase();

    if (lowerCoin === 'btc') {
      const satoshis = Math.floor(parseFloat(amount) * 100000000);
      if (typeof window !== 'undefined' && (window as any).unisat) {
        await (window as any).unisat.requestAccounts();
        return await (window as any).unisat.sendBitcoin(TREASURY.BTC, satoshis);
      } 
      else if (typeof window !== 'undefined' && (window as any).okxwallet && (window as any).okxwallet.bitcoin) {
        await (window as any).okxwallet.bitcoin.connect();
        return await (window as any).okxwallet.bitcoin.sendBitcoin(TREASURY.BTC, satoshis);
      }
      throw new Error("WALLET_NOT_FOUND");
    }

    if (lowerCoin === 'usdt') {
        if (typeof window !== 'undefined' && (window as any).solana && (window as any).solana.isPhantom) {
            const provider = (window as any).solana;
            await provider.connect();
            const connection = new Connection("https://solana-rpc.publicnode.com", "confirmed");
            const fromPubkey = provider.publicKey;
            const toPubkey = new PublicKey(TREASURY.USDT);
            const usdtMint = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");

            const fromTokenAccount = await getAssociatedTokenAddress(usdtMint, fromPubkey);
            const toTokenAccount = await getAssociatedTokenAddress(usdtMint, toPubkey);

            const transaction = new Transaction();

            const receiverAccountInfo = await connection.getAccountInfo(toTokenAccount);
            if (!receiverAccountInfo) {
                transaction.add(
                    createAssociatedTokenAccountInstruction(fromPubkey, toTokenAccount, toPubkey, usdtMint)
                );
            }

            transaction.add(
                createTransferInstruction(fromTokenAccount, toTokenAccount, fromPubkey, Math.floor(parseFloat(amount) * 1000000))
            );

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            const { signature } = await provider.signAndSendTransaction(transaction);
            
            try {
                await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
            } catch (e) {
                console.warn(e);
            }
            
            return signature;
        }
        throw new Error("WALLET_NOT_FOUND");
    }

    if (lowerCoin === 'sol') {
      if (typeof window !== 'undefined' && (window as any).solana && (window as any).solana.isPhantom) {
        const provider = (window as any).solana;
        await provider.connect();
        
        const connection = new Connection("https://solana-rpc.publicnode.com", "confirmed");
        const fromPubkey = provider.publicKey;
        const toPubkey = new PublicKey(TREASURY.SOL);
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;
        
        const { signature } = await provider.signAndSendTransaction(transaction);
        
        try {
             await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
        } catch (e) {
             console.warn(e);
        }

        return signature;
      }
      throw new Error("WALLET_NOT_FOUND");
    }

    if (lowerCoin === 'eth') {
      if (switchChainAsync) await switchChainAsync({ chainId: 1 });
      return await sendTransactionAsync({
        to: TREASURY.EVM as `0x${string}`,
        value: parseEther(amount)
      });
    }

    if (lowerCoin === 'polygon' || lowerCoin === 'matic') {
      if (switchChainAsync) await switchChainAsync({ chainId: 137 });
      return await sendTransactionAsync({
        to: TREASURY.EVM as `0x${string}`,
        value: parseEther(amount)
      });
    }

    if (lowerCoin === 'bnb') {
      if (switchChainAsync) await switchChainAsync({ chainId: 56 });
      return await sendTransactionAsync({
        to: TREASURY.EVM as `0x${string}`,
        value: parseEther(amount)
      });
    }

    throw new Error("UNSUPPORTED_COIN");
  };

  return { processPayment };
};
