import { useRouter } from "next/router";
import React from "react";
import { ethers } from "ethers";
import { initializeBlockchain, contract } from "../blockchain";

const getWalletData = async (
  memberAddress,
  setWalletData,
  userFunds,
  setUserFunds
) => {
  const walletId = await contract.functions.getWalletId(memberAddress);
  const walletOwnerAddress = await contract.functions.getWalletOwner(
    memberAddress
  );
  const walletPublicFunds = await contract.functions.getWalletPublicFunds(
    memberAddress
  );
  const walletMembersAddresses =
    await contract.functions.getWalletMembersAddresses(memberAddress);
  const walletMembersFirstNames =
    await contract.functions.getWalletMembersFirstNames(memberAddress);
  const walletMembersLastNames =
    await contract.functions.getWalletMembersLastNames(memberAddress);
  const walletMembersBalances =
    await contract.functions.getWalletMembersBalances(memberAddress);
  const walletTransactions = await contract.functions.getWalletTransactions(
    memberAddress
  );
  const walletMembersWithdrawalLimits = await contract.functions.getWalletMembersWithdrawalLimits(
    memberAddress
  );

  await walletMembersLastNames;

  for (let i = 0; i < walletMembersAddresses[0].length - 1; i++) {
    setUserFunds(prevState => [...prevState, ""]);
  }

  setWalletData({
    walletId: walletId,
    ownerAddress: walletOwnerAddress,
    publicFunds: walletPublicFunds,
    membersData: walletMembersAddresses.map((address, index) => ({
      address: address,
      firstName: walletMembersFirstNames[index],
      lastName: walletMembersLastNames[index],
      balance: walletMembersBalances[index],
      withdrawalLimit: walletMembersWithdrawalLimits[index]
    })),
    transactions: walletTransactions[0].map((tx) => ({
      date: tx.date,
      value: tx.value,
      sender: tx.senderAddress,
      receiver: tx.recipientAddress,
      type: tx.txType
    })),
  });
};

const HomePage = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const [isLoading, setIsLoading] = React.useState(true);
  const util = require("ethereumjs-util");
  const router = useRouter();
  const isMetaMaskAvailable = typeof window !== "undefined" && window.ethereum;
  const [ethAddress, setEthAddress] = React.useState("");
  const [walletData, setWalletData] = React.useState([]);
  const [userFunds, setUserFunds] = React.useState([""]);
  const [withdrawalLimit, setWithdrawalLimit] = React.useState("");
  const [walletFunds, setWalletFunds] = React.useState("");
  const [showPopup, setShowPopup] = React.useState(false);
  
  const createVault = () => {
    router.push({
      pathname: "/CreateVault",
      query: { initialAddress: ethAddress },
    });
  };

  const leaveWallet = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
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
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isMetaMaskAvailable) return;
    //Update the state whenever the address changes

    window.ethereum.on("accountsChanged", (addresses) => {
      //Disconnecting the last connected account on Metamask redirects the user to the login page
      console.log("LOG LOG LOG LOG LOG LOG LOG ");
      console.log(addresses);
      console.log(ethAddress);
      if (addresses.length == 0 && !ethAddress) {
        router.push("/Login");
      } else {
        //Update the state whenever the address changes
        setEthAddress(util.toChecksumAddress(addresses[0]));
      }
    });

    //Retrieves the current ethAddress if the user changes the address on a different page and then navigates back
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (addresses) => {
        setEthAddress(util.toChecksumAddress(addresses[0]));
      });

    return () => {
      window.ethereum.removeAllListeners("accountsChanged");
    };
  }, [isMetaMaskAvailable]);

  React.useEffect(() => {
    initializeBlockchain();
    getData();
  }, [ethAddress]);

  React.useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);
  }, [router]);

  const getData = async () => {
    setIsLoading(true);

    const data = await getWalletData(
      ethAddress == "" ? initialAddress : ethAddress,
      setWalletData,
      userFunds,
      setUserFunds
    );

    setIsLoading(false);
    if (walletData != null) {
      setIsLoading(false);
    }
  };

  const changeWithdrawalLimit = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const tx = await contract.setWithdrawalLimit(ethAddress, ethers.utils.parseEther(withdrawalLimit));
        // Wait for the transaction to be mined
        setIsLoading(true);
        await tx.wait();
        getData();
      } else {
        // MetaMask is not installed, so show an error message
        console.log("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const sendFundsToMember = async (value, recipientAddress) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const tx = await contract.sendFundsToMember(recipientAddress, {
          value: ethers.utils.parseEther(value),
        });
        // Wait for the transaction to be mined
        setIsLoading(true);
        await tx.wait();
        getData();
      } else {
        // MetaMask is not installed, so show an error message
        console.log("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const sendFundsToWallet = async (value) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const tx = await contract.sendFundsToWallet({
          value: ethers.utils.parseEther(value),
        });
        // Wait for the transaction to be mined
        setIsLoading(true);
        await tx.wait();
        getData();
      } else {
        // MetaMask is not installed, so show an error message
        console.log("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const withdrawFundsFromWallet = async (value) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        const tx = await contract.withdrawFundsFromWallet(
          ethers.BigNumber.from(ethers.utils.parseEther(value))
        );
        // Wait for the transaction to be mined
        setIsLoading(true);
        await tx.wait();
        getData();
      } else {
        // MetaMask is not installed, so show an error message
        console.log("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const withdrawMemberFunds = async (value, limit) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {

        const gasLimit = 5000000;
        const enableWithdrawal = await contract.checkWithdrawalLimit(
          ethers.BigNumber.from(ethers.utils.parseEther(value)).toString(),
          limit
        );

        if (enableWithdrawal == true) {
          const tx = await contract.withdrawMemberFunds(
            ethers.BigNumber.from(ethers.utils.parseEther(value)).toString(),
            { gasLimit }
          );
          setIsLoading(true);
          await tx.wait();
          // Wait for the transaction to be mined
          getData();
        }
      } else {
        // MetaMask is not installed, so show an error message
        console.log("Please install MetaMask to use this feature");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleUserFunds = (e, index) => {
    const values = [...userFunds];
    values[index] = e.target.value;
    setUserFunds(values);
  };

  const handleWalletFunds = (e) => {
    console.log("WALLET FUNDS WALLET FUNDS WALLET FUNDS ");
    setWalletFunds(e.target.value);
  };

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };
  
  return isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
    <div>
       <button onClick={handleButtonClick}>Info pop-up!</button>
      <div className={showPopup ? 'popup-overlay active' : 'popup-overlay'}>
        {showPopup && (
          <div className="popup">
            <div className="popup-inner">
              <h1>Welcome to the vault!</h1>
              <p>The vault enables multiple users to join a wallet. Here is the list of the benefits:</p>
              <ul>
                <li>Each wallet has public funds that can be withdrawn by each member of the wallet with no limitations.</li>
                <li>When a wallet is created, it has an owner, members and hourly withdrawal limits set for each member.</li>
                <li>The wallet enables each member to have its own private ETH storage.</li>
                <li>Each wallet has a transaction list that displays all the internal and external transactions.</li>
              </ul>
              <h2>Use cases:</h2>
              <ul>
                <li>A family wants to save some money and set up withdrawal limits for each member, but also share a public fund that is meant to help any member in need.</li>
                <li>School groups that have a public fund, but each parent wants to make sure that the children do not spend more than allowed.</li>
              </ul>
              <h2>Tips:</h2>
              <ul>
                <li>Errors are thrown in the console.</li>
                <li>Access the console by pressing: ctrl + shift + j.</li>
              </ul>
              <button className="close-button" onClick={handleClosePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {walletData && walletData.walletId != 0 ? (
        <div>
      <h1>Your Ethereum address</h1>
      <h5> {ethAddress}</h5>
          <h2>Wallet Data</h2>
          <ul>
            <li>
              <strong>Wallet Id:</strong> {walletData.walletId}
            </li>
            <li>
              <strong>Owner Address:</strong> {walletData.ownerAddress}
            </li>
            <li>
              <strong>Wallet Public Funds:</strong>{" "}
              {(walletData.publicFunds / 10 ** 18).toFixed(6)} ETH
            </li>
            <li>
              <input
                type="number"
                placeholder=""
                value={walletFunds}
                onChange={(e) => handleWalletFunds(e)}
              />
              <button
                onClick={() => sendFundsToWallet(walletFunds)}
              >
                Send funds
              </button>
              <button
                onClick={() => withdrawFundsFromWallet(walletFunds)}
              >
                Withdraw funds
              </button>
            </li>
          </ul>
          <h2>Member List</h2>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {walletData &&
              walletData.membersData &&
              walletData.membersData.map((member, index) => (
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

                        <li>
                          <strong>Balance:</strong>{" "}
                          {(
                            ethers.BigNumber.from(
                              ethers.BigNumber.from(member.balance[i])
                            ) /
                            10 ** 18
                          ).toString()}
                        </li>
                        <li>
                          <input
                            type="number"
                            placeholder=""
                            value={userFunds[i]}
                            onChange={(e) => handleUserFunds(e, i)}
                          />
                        </li>
                        <li>

                          {ethAddress == address ? (<button
                            onClick={() =>
                              withdrawMemberFunds(userFunds[i], member.withdrawalLimit[i].toString())
                            }
                          >
                            Withdraw funds
                          </button>) : null}
                          <button
                            onClick={() => sendFundsToMember(userFunds[i], address)}
                          >
                            Send funds
                          </button>
                        </li>
                        <li>
                          <strong>Hourly withdrawal limit:</strong>{" "}
                          {(
                            ethers.BigNumber.from(
                              ethers.BigNumber.from(member.withdrawalLimit[i])
                            ) /
                            10 ** 18
                          ).toString()}
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {walletData &&
              walletData.membersData &&
              walletData.membersData.map((member, index) => (
                <div key={index}>
                  {member.address.map((address, i) => (
                    <div key={i}>
                      <ul>
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
          </div>
          <h2>Transactions</h2>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {walletData &&
                walletData.transactions &&
                walletData.transactions.map((transaction, index) => (
                  <div key={index}>
                    {
                      transaction.type == "sendUserToUser" ? (
                        <ul>
                          <li>
                            <strong>Send User to User</strong>
                          </li>
                          <li>
                            <strong>Date:</strong>
                            {Date(
                              ethers.BigNumber.from(transaction.date) * 1000
                            ).toString()}
                          </li>

                          <li>
                            <strong>Value:</strong>
                            {(
                              ethers.BigNumber.from(
                                ethers.BigNumber.from(transaction.value)
                              ) /
                              10 ** 18
                            ).toString()}
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
                      ) : null
                    }
                    {
                      transaction.type == "withdrawUserToUser" ? (
                        <ul>
                          <li>
                            <strong>Withdraw User to User</strong>
                          </li>
                          <li>
                            <strong>Date:</strong>
                            {Date(
                              ethers.BigNumber.from(transaction.date) * 1000
                            ).toString()}
                          </li>

                          <li>
                            <strong>Value:</strong>
                            {(
                              ethers.BigNumber.from(
                                ethers.BigNumber.from(transaction.value)
                              ) /
                              10 ** 18
                            ).toString()}
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
                      ) : null
                    }
                    {
                      transaction.type == "sendUserToWallet" ? (
                        <ul>
                          <li>
                            <strong>Send User to Wallet</strong>
                          </li>
                          <li>
                            <strong>Date:</strong>
                            {Date(
                              ethers.BigNumber.from(transaction.date) * 1000
                            ).toString()}
                          </li>

                          <li>
                            <strong>Value:</strong>
                            {(
                              ethers.BigNumber.from(
                                ethers.BigNumber.from(transaction.value)
                              ) /
                              10 ** 18
                            ).toString()}
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
                      ) : null
                    }
                    {
                      transaction.type == "withdrawWalletToUser" ? (
                        <ul>
                          <li>
                            <strong>Withdraw Wallet to User</strong>
                          </li>
                          <li>
                            <strong>Date:</strong>
                            {Date(
                              ethers.BigNumber.from(transaction.date) * 1000
                            ).toString()}
                          </li>

                          <li>
                            <strong>Value:</strong>
                            {(
                              ethers.BigNumber.from(
                                ethers.BigNumber.from(transaction.value)
                              ) /
                              10 ** 18
                            ).toString()}
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
                      ) : null
                    }
                  </div>
                ))}
            </div>
          </div>
          <button onClick={leaveWallet}>Leave the wallet</button>
        </div>
      ) : (
       <div className="container">
  <div className="message">
    <h1>Your Ethereum address</h1>
    <h5>{ethAddress}</h5>
  <button className="info-btn" onClick={handleButtonClick}>Info Pop-Up</button>
    <button className="create-btn" onClick={createVault}>Create a wallet</button>
  </div>
</div>
      )
      }
    </div >
  );
};

HomePage.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null;
  return { initialAddress };
};

export default HomePage;
