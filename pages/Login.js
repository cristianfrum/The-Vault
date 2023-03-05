import React from 'react'
import { useRouter } from 'next/router'

const LoginPage = () => {
  const router = useRouter();
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require('ethereumjs-util');

  // Initializing state variables
  const [initialAddress, setInitialAddress] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(false)

  //Check if MetaMask is installed
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum

  //
  //
  React.useEffect(() => {
    if (!isMetaMaskAvailable) return

    //Update the state whenever the address changes
    window.ethereum.on('accountsChanged', async (addresses) => {
      if (addresses.length != 0) {
        setInitialAddress(util.toChecksumAddress(addresses[0]));
      }
    });

    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
    if (accounts.length > 0) {
      // Set the initialAddress to the first account in the list
      setInitialAddress(util.toChecksumAddress(accounts[0]));
    }
  });

  }, [isMetaMaskAvailable])

  React.useEffect(() => {
    if (!initialAddress) return
    router.push({
      pathname: '/HomePage',
      query: { initialAddress }
    })
  }, [initialAddress])

  const handleLogin = async () => {

    if (!isMetaMaskAvailable) return

    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setInitialAddress(addresses[0])
    })
  };

  return (
    <div className="container">
      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="message">
          <h1>Welcome to The Vault!</h1>
          <p>To use this app, you need to install and sign in with MetaMask.</p>
          <button className="login-btn" onClick={handleLogin}>
            Login with MetaMask
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
