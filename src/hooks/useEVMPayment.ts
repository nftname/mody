import { useSendTransaction, useWriteContract, useSwitchChain } from 'wagmi';
import { parseAbi, parseEther, toHex } from 'viem';

const USDT_POLYGON_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const ERC20_ABI = parseAbi(["function transfer(address to, uint256 amount) returns (bool)"]);

export const useEVMPayment = () => {
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();

  const processEVMPayment = async (coin: string, address: string, amount: string) => {
    const lowerCoin = coin.toLowerCase();

    if (lowerCoin === 'eth' || lowerCoin === 'bnb') {
      let provider = (window as any).ethereum;
      
      if (provider?.providers) {
        provider = provider.providers.find((p: any) => p.isMetaMask) || provider;
      }

      if (provider && provider.isMetaMask) {
        const chainId = lowerCoin === 'eth' ? '0x1' : '0x38';
        
        await provider.request({ method: 'eth_requestAccounts' });
        
        const currentChainId = await provider.request({ method: 'eth_chainId' });
        
        if (currentChainId !== chainId) {
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId }],
            });
          } catch (error: any) {
            throw error;
          }
        }

        const accounts = await provider.request({ method: 'eth_accounts' });
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: accounts[0],
            to: address,
            value: toHex(parseEther(amount)),
          }],
        });
        return txHash;
      }
      throw new Error("WALLET_NOT_FOUND");
    }

    if (lowerCoin === 'usdt') {
      if (switchChainAsync) await switchChainAsync({ chainId: 137 }).catch(() => {});
      const usdtAmount = BigInt(Math.floor(parseFloat(amount) * 1000000));
      return await writeContractAsync({
        address: USDT_POLYGON_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [address as `0x${string}`, usdtAmount],
      });
    } 
    
    if (switchChainAsync) await switchChainAsync({ chainId: 137 }).catch(() => {});
    return await sendTransactionAsync({
      to: address as `0x${string}`,
      value: parseEther(amount)
    });
    
  };

  return { processEVMPayment };
};

