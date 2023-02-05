import React from 'react'
import Link from 'next/link';
import abi from '../utils/TheVault.json';
import { ethers } from 'ethers';

const CreateVault = () => {
  const [walletName, setWalletName] = React.useState('');
  const contractAddress = "0xbDc6eB6465904Eba59C194Ab8124B1D03Fe20763";
  const contractABI = abi.abi;

  const initializeWalletName = (event) => {
    setWalletName(event.target.value);
    console.log("input: " + walletName);
  };

  const createTheWallet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const theVault = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("creating the wallet..");
        const vault = await theVault.initializeWallet(walletName, {
          value: ethers.utils.parseEther('0.001'),
          gasPrice: ethers.utils.parseUnits('20', 'gwei'),
        });

        await vault.wait();

        console.log("mined ", vault.hash);

        console.log("Wallet created!");

        // Clear the form fields.
        // setName("");
        // setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  }

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
        const info = await theVault.getWalletId("Wallet4");
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
      <h1>Welcome to the Vault</h1>
      <input type="text" placeholder="Type wallet's name..." value={walletName} onChange={initializeWalletName} />
      <button onClick={createTheWallet}>Create the wallet</button>
      <button onClick={getWalletId}>Get wallet's id</button>
      <Link href="/">
        <button>Go to the home page</button>
      </Link>
    </div>)

}
export default CreateVault;