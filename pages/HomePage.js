import { useRouter } from 'next/router'
import React from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../global";

const getWalletData = async (memberAddress, setWalletData) => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const data = await contract.functions
        .getWalletData(memberAddress);
      setWalletData({
        walletId: data[0],
        ownerAddress: data[1],
        balance: ethers.BigNumber.from(data[2]).toString(),
        membersAddresses: data[3],
        membersFirstNames: data[4],
        membersLastNames: data[5]
      });
      await data.wait();
    } else {
      console.log("Metamask is not connected");
    }
  } catch (error) {
    console.log(error);
  }
};

const HomePage = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const [isLoading, setIsLoading] = React.useState(true);
  const util = require('ethereumjs-util');
  const router = useRouter();
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum
  const [ethAddress, setEthAddress] = React.useState('')
  const [walletData, setWalletData] = React.useState([]);

  const createVault = () => {
    if (ethAddress == '') {
      router.push({
        pathname: '/CreateVault',
        query: { initialAddress: initialAddress }
      });
    } else {
      router.push({
        pathname: '/CreateVault',
        query: { initialAddress: ethAddress }
      });
    }
  };

  const leaveWallet = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        setIsLoading(true);
        const execute = await contract.leaveWallet((ethAddress == '') ? initialAddress : ethAddress);
        await execute.wait();
        getData();
        console.log(execute);
        console.log("ERASED");
      } else {
        console.log("Please install MetaMask")
      }
    }
    catch (error) {
      console.log(error);
    }
  }

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

  React.useEffect(() => {
    getData();
  }, [ethAddress])

  React.useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)
  }, [router])

  const getData = async () => {
    setIsLoading(true);
    const data = await getWalletData((ethAddress == '') ? initialAddress : ethAddress, setWalletData);
    setIsLoading(false);
    if (walletData != null) {
      setIsLoading(false);
      console.log("FETCHED!");
      console.log(data);
      console.log(walletData);
      console.log(walletData.walletId);
      console.log(walletData.ownerAddress);
      console.log(walletData.membersAddresses);
      console.log(walletData.membersFirstNames);
      console.log(walletData.membersLastNames);
    }
  };

  return (
    isLoading ? (<h5>"Loading..."</h5>) : (<div>
      <h1>Your Ethereum address</h1>
      <h5> {ethAddress == '' ? initialAddress : ethAddress}</h5>
      {
        walletData && walletData.walletId != 0 ? (
          <div>
            <h2>Wallet Data</h2>
            <ul>
              <li>
                <strong>Wallet Id:</strong> {walletData.walletId}
              </li>
              <li>
                <strong>Owner Address:</strong> {walletData.ownerAddress}
              </li>
              <li>
                <strong>Wallet Balance:</strong> {(walletData.balance / 10 ** 18).toFixed(6)} ETH
              </li>
            </ul>
            <h2>Member List</h2>
            {
              walletData && walletData.membersAddresses && walletData.membersAddresses.map((address, index) => (
                <ul key={index}>
                  <li>
                    <strong>Address:</strong> {address}
                  </li>
                  <li>
                    <strong>First Name:</strong> {walletData.membersFirstNames[index]}
                  </li>
                  <li>
                    <strong>Last Name:</strong> {walletData.membersLastNames[index]}
                  </li>
                </ul>
              ))
            }
          </div>
        ) : (
          <div>
            <p>You did not join a vault</p>
          </div>
        )
      }
      <button onClick={createVault}>
        Create a wallet
      </button>
      <button onClick={leaveWallet}>
        Leave the wallet
      </button>
    </div>)
  );
}

HomePage.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null
  return { initialAddress }
}

export default HomePage;