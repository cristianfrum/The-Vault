import React from 'react'
import { useRouter } from 'next/router'

const LoginPage = () => {
  const router = useRouter();

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
    window.ethereum.on('accountsChanged', async (addresses) => {
      setEthAddress(addresses[0])
    });

    //Update the state when the user logs in
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setEthAddress(addresses[0])
    })

  }, [isMetaMaskAvailable])

  React.useEffect(() => {
    if (!ethAddress) return

    router.push({
      pathname: '/HomePage',
      query: { ethAddress }
    })
  }, [ethAddress])

  const handleLogin = async () => {

    if (!isMetaMaskAvailable) return

    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setEthAddress(addresses[0])
    })
  };

  return (
    <div>
      {error && <div>{error}</div>}
      <div>
        <div>Please install and sign in with MetaMask</div>
        <button disabled={isLoading} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  )
}

export default LoginPage;