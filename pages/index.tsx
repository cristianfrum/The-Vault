import React from 'react'
import abi from '../utils/TheVault.json';

declare global {
  interface Window {
    ethereum: any
  }
}

const IndexPage = () => {
  // Contract Address & ABI
  const contractAddress = "0x9162e4693Fdb524794a1251067fD1EA969102C47";
  const contractABI = abi.abi;

  // Initializing state variables
  const [ethAddress, setEthAddress] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  //Check if MetaMask is installed
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum

  //
  React.useEffect(() => {
    if (!isMetaMaskAvailable) return

    //Update the state whenever the address changes
    window.ethereum.on('accountsChanged', async (addresses: any[]) => {
      setEthAddress(addresses[0])
    });

    //Update the state when the user logs in
    window.ethereum.request({ method: 'eth_requestAccounts' }).then((addresses: any) => {
      setEthAddress(addresses[0])
    })

  }, [isMetaMaskAvailable])

  const handleLogin = async () => {

    if (!isMetaMaskAvailable) return

    window.ethereum.request({ method: 'eth_requestAccounts' }).then((addresses: any) => {
      setEthAddress(addresses[0])
    })
  };

  return (
    <div>
      {error && <div>{error}</div>}
      {ethAddress ? (
        <div>
          Logged in with Ethereum address: {ethAddress}
        </div>
      ) : (
        <div>
          <div>Please install and sign in with MetaMask</div>
          <button disabled={isLoading} onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
    </div>
  )
}

export default IndexPage