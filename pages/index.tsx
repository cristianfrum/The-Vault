import React from 'react'

declare global {
  interface Window {
    ethereum: any
  }
}

const IndexPage = () => {
  const [ethAddress, setEthAddress] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum

  React.useEffect(() => {
    if (!isMetaMaskAvailable) return

    window.ethereum.on('accountsChanged', async (addresses: any[]) => {
      setEthAddress(addresses[0])
    });

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

  const handleLogout = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts', params: [ethAddress] });
      setEthAddress(null);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      {error && <div>{error}</div>}
      {ethAddress ? (
        <div>
          Logged in with Ethereum address: {ethAddress}
          <button disabled={isLoading} onClick={handleLogout}>
            Logout
          </button>
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