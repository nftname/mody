import { useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseAbi, parseEther } from 'viem';

const USDT_POLYGON_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const ERC20_ABI = parseAbi(["function transfer(address to, uint256 amount) returns (bool)"]);

export const useEVMPayment = () => {
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const processEVMPayment = async (coin: string, address: string, amount: string) => {
    const lowerCoin = coin.toLowerCase();

    if (lowerCoin === 'eth') {
      if (switchChainAsync) await switchChainAsync({ chainId: 1 });
      return await sendTransactionAsync({
        to: address as `0x${string}`,
        value: parseEther(amount)
      });
    }

    if (lowerCoin === 'bnb') {
      if (switchChainAsync) await switchChainAsync({ chainId: 56 });
      return await sendTransactionAsync({
        to: address as `0x${string}`,
        value: parseEther(amount)
      });
    }

    if (lowerCoin === 'usdt') {
      if (switchChainAsync) await switchChainAsync({ chainId: 137 });
      const usdtAmount = BigInt(Math.floor(parseFloat(amount) * 1000000));
      return await writeContractAsync({
        address: USDT_POLYGON_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [address as `0x${string}`, usdtAmount],
      });
    } 
    
    if (lowerCoin === 'polygon' || lowerCoin === 'matic') {
      if (switchChainAsync) await switchChainAsync({ chainId: 137 });
      return await sendTransactionAsync({
        to: address as `0x${string}`,
        value: parseEther(amount)
      });
    }
    
    throw new Error("UNSUPPORTED_COIN");
  };

  return { processEVMPayment };
};
