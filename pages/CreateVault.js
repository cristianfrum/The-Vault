import React from 'react'
import Link from 'next/link';
import abi from '../utils/TheVault.json';
import { ethers } from 'ethers';

const CreateVault = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require('ethereumjs-util');
  const [walletName, setWalletName] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState('');
  const contractAddress = "0xEE4d9108A44ca8AB9592dBE0C792fEb282465e3e";
  const contractABI = abi.abi;
  const [ethAddress, setEthAddress] = React.useState('');
  const [membersAddresses, setMembersAddresses] = React.useState([initialAddress]);
  const [membersFirstNames, setMembersFirstNames] = React.useState(['']);
  const [membersLastNames, setMembersLastNames] = React.useState(['']);
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  const initializeWalletName = (event) => {
    setWalletName(event.target.value);
    console.log("input: " + walletName);
  };

  const initializeWalletBalance = (event) => {
    setWalletBalance(event.target.value);
    console.log("input: " + walletBalance);
  };

  React.useEffect(() => {
    if (!isMetaMaskAvailable) return

    //Update the state whenever the address changes
    window.ethereum.on('accountsChanged', async (addresses) => {  setMembersAddresses(prevAddresses => [addresses[0], ...prevAddresses.slice(1)]);
      setEthAddress(util.toChecksumAddress(addresses[0]));
    });

    //Update the state when the user logs in
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setEthAddress(util.toChecksumAddress(addresses[0]));
    })

  }, [isMetaMaskAvailable])

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

        try {
          // ...
          console.log("walletName: ", walletName);
          // ...
        } catch (error) {
          console.log(error);
        }

        console.log("creating the wallet..");
        console.log(membersAddresses);
        console.log(ethAddress);
        console.log(membersFirstNames);
        console.log(membersLastNames);

        const vault = await theVault.initializeWallet(walletName, membersAddresses, membersFirstNames, membersLastNames, {
          value: ethers.utils.parseEther(walletBalance),
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

  const handleAddInput = () => {
    setMembersAddresses([...membersAddresses, '']);
    setMembersFirstNames([...membersFirstNames, '']);
    setMembersLastNames([...membersLastNames, '']);
  };

  const handleRemoveInput = () => {
    if (membersAddresses.length > 1) {
      setMembersAddresses(membersAddresses.slice(0, -1));
      setMembersFirstNames(membersFirstNames.slice(0, -1));
      setMembersLastNames(membersLastNames.slice(0, -1));
    }
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
      <button onClick={handleRemoveInput}>Remove Member</button>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersAddresses.map((input, index) => (
            index == 0 ? (<input key={index} type="text" 
              value={membersAddresses[0]}
              readOnly
            />) : (<input key={index} type="text" placeholder="Type user' address..."
              value={input.value}
              onChange={e => handleChangeAddresses(e, index)}
            />)
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersFirstNames.map((input, index) => (
            <input key={index} type="text" placeholder="Type user' first name..."
              value={input.value}
              onChange={e => handleChangeFirstNames(e, index)}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {membersLastNames.map((input, index) => (
            <input key={index} type="text" placeholder="Type users' last name..."
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
        <Link href="/">
          <button>Go to the home page</button>
        </Link>
      </div>
    </div>)

}

CreateVault.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null

  return { initialAddress }
}

export default CreateVault;