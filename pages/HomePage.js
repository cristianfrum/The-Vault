import { useRouter } from 'next/router'
import React from 'react'
import {ethers} from 'ethers'
import abi from '../utils/TheVault.json';

const HomePage = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require('ethereumjs-util');
  const contractAddress = "0x10ab8bE67086eD3bc3743395d5D753ccF192F52C";
  const contractABI = abi.abi;
  const router = useRouter();
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum
  const [ethAddress, setEthAddress] = React.useState('')

  const createVault = () => {
    router.push({
      pathname: '/CreateVault',
      query: { initialAddress }
    });
  };

  React.useEffect(() => {
    if (!isMetaMaskAvailable) return

    //Update the state whenever the address changes
    window.ethereum.on('accountsChanged', async (addresses) => {
      setEthAddress(util.toChecksumAddress(addresses[0]));
    });

    //Update the state when the user logs in
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setEthAddress(util.toChecksumAddress(addresses[0]));
    })

  }, [isMetaMaskAvailable])

  const getWalletId = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const theVault = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching info from the blockchain..");
        const info = await theVault.getWallet(ethAddress == null ? initialAddress : ethAddress);
        console.log("fetched!");
        console.log(info);
        //  setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Your Ethereum address</h1>
      <p> {ethAddress == null ? initialAddress : ethAddress}</p>
      <button onClick={createVault}>
        Create a vault
      </button>
      <div>
        <button onClick={getWalletId}>Get wallet's id</button>
      </div>
    </div>
  )
}

HomePage.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null
  return { initialAddress }
}

export default HomePage;