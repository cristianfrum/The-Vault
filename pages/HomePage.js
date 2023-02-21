import { useRouter } from 'next/router'
import React from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../global";

const getWalletData = async (memberAddress, setWalletData, userFunds, setUserFunds) => {
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

      const walletId = await contract.functions
        .getWalletId(memberAddress);
      const walletOwnerAddress = await contract.functions
        .getWalletOwner(memberAddress);
      const walletBalance = await contract.functions
        .getWalletBalance(memberAddress); 
      const walletMembersAddresses = await contract.functions
        .getWalletMembersAddresses(memberAddress);  
      const walletMembersFirstNames = await contract.functions
        .getWalletMembersFirstNames(memberAddress); 
      const walletMembersLastNames = await contract.functions
        .getWalletMembersLastNames(memberAddress); 
      const walletMembersBalances = await contract.functions
        .getWalletMembersBalances(memberAddress); 
      const walletTransactions = await contract.functions.getWalletTransactions(memberAddress);
      
      await walletMembersLastNames.wait;

      for(let i=0; i <walletMembersFirstNames.length; i++) {
        setUserFunds([...userFunds, '']);
      }

      setWalletData({
        walletId: walletId,
        ownerAddress: walletOwnerAddress,
        balance: walletBalance,
        membersData: walletMembersAddresses.map((address, index) => ({
          address: address,
          firstName: walletMembersFirstNames[index],
          lastName: walletMembersLastNames[index],
          balance: walletMembersBalances[index]
        })),
        transactions: walletTransactions[0].map((tx) => ({
          date: tx.date,
          value: tx.value,
          sender: tx.sender,
          receiver: tx.receiver
        }))
      });

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
  const [userFunds, setUserFunds] = React.useState(['']);

  const createVault = () => {
    router.push({
        pathname: '/CreateVault',
        query: { initialAddress: ethAddress }
      });
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
try {
  const execute = await contract.leaveWallet(ethAddress);
  await execute.wait();
        getData();
} catch (error) {
  setIsLoading(false);
  console.log("Transaction rejected or failed: ", error);
}
      }
    }
    catch (error) {
      console.log(error);
    }
  }


  React.useEffect(() => {
    if (!isMetaMaskAvailable) return
    //Update the state whenever the address changes

    window.ethereum.on('accountsChanged', (addresses) => {
      //Disconnecting the last connected account on Metamask redirects the user to the login page
      if (addresses.length == 0) {
        router.push('/Login');
      } else {
        //Update the state whenever the address changes
        setEthAddress(util.toChecksumAddress(addresses[0]));
      }
    });

    //Retrieves the current ethAddress if the user changes the address on a different page and then navigates back
    window.ethereum.request({ method: 'eth_requestAccounts' }).then(async (addresses) => {
      setEthAddress(util.toChecksumAddress(addresses[0]));
    });


    return () => {
      window.ethereum.removeAllListeners('accountsChanged');
    };
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

    const data = await getWalletData((ethAddress == '') ? initialAddress : ethAddress, setWalletData, userFunds, setUserFunds);

    setIsLoading(false);
    if (walletData != null) {
      setIsLoading(false);
    }
  };

  const sendFunds = async (value, receiverAddress) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Create a provider using the Web3Provider from ethers.js
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          // Get the signer from the provider
          const signer = provider.getSigner();
          // Create a contract instance using the CONTRACT_ADDRESS and CONTRACT_ABI
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          // Call the sendFunds function on the contract
          const tx = await contract.sendFunds(ethAddress, receiverAddress, 
                                              {
                                                value: ethers.utils.parseEther(value)
                                              });
          // Wait for the transaction to be mined
          setIsLoading(true);
          await tx.wait();
          getData();
      } else {
        // MetaMask is not installed, so show an error message
        console.log('Please install MetaMask to use this feature');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleUserFunds = (e, index) => {
    const values = [...userFunds];
    values[index] = e.target.value;
    setUserFunds(values);
  };

  return (
    isLoading ? (<h5>"Loading..."</h5>) : (<div>
      <h1>Your Ethereum address</h1>
      <h5> {ethAddress}</h5>
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
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {walletData && walletData.membersData && walletData.membersData.map((member, index) => (
                  <div key={index}>
                    {member.address.map((address, i) => (
                      <div key={i}>
                        <ul>
                          <li>
                            <strong>Address:</strong> {address}
                          </li>
                          <li>
                            <strong>First Name:</strong> {member.firstName[i]}
                          </li>
                          <li>
                            <strong>Last Name:</strong> {member.lastName[i]}
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {walletData && walletData.membersData && walletData.membersData.map((member, index) => (
                  <div key={index}>
                    {member.address.map((address, i) => (
                      <div key={i}>
                        <ul>
                          <li>
                            <strong>Balance:</strong> {(ethers.BigNumber.from(ethers.BigNumber.from(member.balance[i])) / 10 ** 18).toString()}
                          </li>
                          <li>
                            <input type="number" placeholder="..." value={userFunds[i]} onChange={e => handleUserFunds(e, i)} />
                          </li>
                          <li>
                            <button onClick={() => sendFunds(userFunds[i], address)}>Send funds
                            </button>
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <h2>Transactions</h2>
            <div style={{display: "flex", flexDirection: "row"}}>
              <div style={{display: "flex", flexDirection: "column"}}>
                {walletData && walletData.transactions && walletData.transactions.map((transaction, index) => (
                  <div key={index}>
                    <ul>
                    <li>
                    <strong>Date:</strong>
                     {Date(ethers.BigNumber.from(transaction.date) * 1000).toString()}
                    </li>
                      
                      <li>
                    <strong>Value:</strong>
                     {(ethers.BigNumber.from(ethers.BigNumber.from(transaction.value)) / 10 ** 18).toString()}
                    </li>
                      <li>
                    <strong>Sender:</strong>
                     {transaction.sender}
                    </li>
                      <li>
                    <strong>Receiver:</strong>
                     {transaction.receiver}
                    </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={leaveWallet}>
              Leave the wallet
            </button>
          </div>
        ) : (
          <div>
            <p>You did not join a vault</p>
            <button onClick={createVault}>
              Create a wallet
            </button>
          </div>
        )
      }
    </div>)
  );
}

HomePage.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null
  return { initialAddress }
}

export default HomePage;