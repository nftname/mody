
export const useNonEVMPayment = () => {
  const processNonEVMPayment = async (coin: string, address: string, amount: string) => {
    const lowerCoin = coin.toLowerCase();
    await navigator.clipboard.writeText(address);
    const protocol = lowerCoin === 'btc' ? 'bitcoin:' : 'solana:';
    window.location.href = `${protocol}${address}?amount=${amount}`;
    return true; 
  };

  return { processNonEVMPayment };
};


