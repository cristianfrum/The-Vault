import React from 'react'
import Link from 'next/link';
import abi from '../utils/TheVault.json';
import { ethers } from 'ethers';

const CreateVault = () => {
  const [walletName, setWalletName] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState('');
  const contractAddress = "0x3e85bb1e7fd4A8e808151836bA5303A82a26eceF";
  const contractABI = abi.abi;
  const [membersAddresses, setMembersAddresses] = React.useState([]);
  const [membersFirstNames, setMembersFirstNames] = React.useState([]);
  const [membersLastNames, setMembersLastNames] = React.useState([]);

  const initializeWalletName = (event) => {
    setWalletName(event.target.value);
    console.log("input: " + walletName);
  };

  const initializeWalletBalance = (event) => {
    setWalletBalance(event.target.value);
    console.log("input: " + walletBalance);
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

        const vault = await theVault.initializeWallet(walletName, membersAddresses, membersFirstNames, membersLastNames, {
          value: ethers.utils.parseEther(walletBalance),
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
        const info = await theVault.getWalletId(walletName);
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

  const getWalletBalance = async () => {
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
        const info = await theVault.getWalletBalance(walletName) / 10 ** 18;
        console.log("fetched!");
        console.log(info);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleAddInput = () => {
    setMembersAddresses([...membersAddresses, '']);
    setMembersFirstNames([...membersFirstNames, '']);
    setMembersLastNames([...membersLastNames, '']);
  };

  const handleChangeAddresses = (e, index) => {
    const values = [...membersAddresses];
    values[index] = e.target.value;
    setMembersAddresses(values);
  };

  const handleChangeFirstNames = (e, index) => {
    const values = [...membersFirstNames];
    values[index] = e.target.value;
    setMembersFirstNames(values);
  };

  const handleChangeLastNames = (e, index) => {
    const values = [...membersLastNames];
    values[index] = e.target.value;
    setMembersLastNames(values);
  };

  return (
    <div>
      <h1>Welcome to the Vault</h1>
      <input type="text" placeholder="Type wallet's name..." value={walletName} onChange={initializeWalletName} />
      <button onClick={handleAddInput}>Add New Member</button>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersAddresses.map((input, index) => (
            <input type="text" placeholder="Type user' address..."
              value={input.value}
              onChange={e => handleChangeAddresses(e, index)}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersFirstNames.map((input, index) => (
            <input type="text" placeholder="Type user' first name..."
              value={input.value}
              onChange={e => handleChangeFirstNames(e, index)}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersLastNames.map((input, index) => (
            <input type="text" placeholder="Type users' last name..."
              value={input.value}
              onChange={e => handleChangeLastNames(e, index)}
            />
          ))}
        </div>
      </div>
      <input type="text" placeholder="Set wallet's balance..." value={walletBalance} onChange={initializeWalletBalance} />
      <div>
        <button onClick={createTheWallet}>Create the wallet</button>
      </div>
      <div>
        <button onClick={getWalletId}>Get wallet's id</button>
      </div>
      <div>
        <button onClick={getWalletBalance}>Get wallet's balance</button>
      </div>
      <div>
        <Link href="/">
          <button>Go to the home page</button>
        </Link>
      </div>
    </div>)

}
export default CreateVault;