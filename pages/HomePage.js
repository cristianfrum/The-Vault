import { useRouter } from 'next/router'
import React from 'react'
import { ethers } from 'ethers'
import abi from '../utils/TheVault.json';


const getWalletData = async (memberAddress, setWalletData) => {
  try{
    const {ethereum} = window;
    if(ethereum) {
  const contractAddress = "0xA182F3C0D0650bfE39fA49172b94686a15FAC638";
  const contractABI = abi.abi;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  const data = await contract.functions
    .getWalletData(memberAddress);

  setWalletData({
    walletId: data[0],
    ownerAddress: data[1],
    balance: data[2],
    membersAddresses: data[3],
    membersFirstNames: data[4],
    membersLastNames: data[5]
  });
    }else {
        console.log("Metamask is not connected");
      }
  } catch(error) {
    console.log(error);
  }
};

const HomePage = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require('ethereumjs-util');
  const contractAddress = "0xaEB95E065CEf071Eeb2385d90f52fBB907e28489";
  const contractABI = abi.abi;
  const router = useRouter();
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum
  const [ethAddress, setEthAddress] = React.useState('')
  const [walletData, setWalletData] = React.useState([]);

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

  React.useEffect(() => { 
    getData();
  }, [ethAddress])

  const getData = async () => {
     
          const data = await getWalletData((ethAddress == null || ethAddress == '') ? initialAddress : ethAddress, setWalletData);
          if(walletData != null) {
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
    <div>
      <h1>Your Ethereum address</h1>
      <h5> {ethAddress == null ? initialAddress : ethAddress}</h5>
      <button onClick={createVault}>
        Create a vault
      </button>
      <div>
        <h2>Retrieved Data</h2>
        <ul>
          <li><strong>Wallet Id:</strong> {walletData.walletId}</li>
          <li><strong>Owner Address:</strong> {walletData.ownerAddress}</li>
          <li><strong>Members Addresses:</strong> {walletData.membersAddresses}</li>
          <li><strong>Members First Names:</strong> {walletData.membersFirstNames}</li>
          <li><strong>Members Last Names:</strong> {walletData.membersLastNames}</li>
        </ul>
      </div>
    </div>
  )
}

HomePage.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null
  return { initialAddress }
}

export default HomePage;