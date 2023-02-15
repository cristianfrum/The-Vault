import React from 'react'
import Link from 'next/link';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../global.js';
import { ethers } from 'ethers';

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

const CreateVault = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require('ethereumjs-util');
  const [walletName, setWalletName] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState('');
  const [ethAddress, setEthAddress] = React.useState('');
  const [membersAddresses, setMembersAddresses] = React.useState([initialAddress]);
  const [membersFirstNames, setMembersFirstNames] = React.useState(['']);
  const [membersLastNames, setMembersLastNames] = React.useState(['']);
  const [walletData, setWalletData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
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
    window.ethereum.on('accountsChanged', async (addresses) => {
      setMembersAddresses(prevAddresses => [addresses[0], ...prevAddresses.slice(1)]);
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

  const createTheWallet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const theVault = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
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

        setIsLoading(true);
        
        const vault = await theVault.initializeWallet(walletName, membersAddresses, membersFirstNames, membersLastNames, {
          value: ethers.utils.parseEther(walletBalance),
        });

        await vault.wait();

        getData();
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
  isLoading ? (<h5>"Loading..."</h5>) : (  <div>
      {
        walletData && walletData.walletId != 0 ? (
          <div>
            <p>You can not create a wallet since you're a member of another wallet</p>
          </div>) : (
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
          </div>
        )
      }
    </div>))

}

CreateVault.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null

  return { initialAddress }
}

export default CreateVault;