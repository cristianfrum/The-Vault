import React from "react";
import Link from "next/link";
import { initializeBlockchain, contract } from "../blockchain";
import { ethers } from "ethers";

const getWalletData = async (memberAddress, setWalletData) => {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const walletId = await contract.functions.getWalletId(memberAddress);
      const walletOwnerAddress = await contract.functions.getWalletOwner(
        memberAddress
      );
      const walletBalance = await contract.functions.getWalletBalance(
        memberAddress
      );
      const walletMembersAddresses =
        await contract.functions.getWalletMembersAddresses(memberAddress);
      const walletMembersFirstNames =
        await contract.functions.getWalletMembersFirstNames(memberAddress);
      const walletMembersLastNames =
        await contract.functions.getWalletMembersLastNames(memberAddress);

      await walletMembersLastNames.wait;

      setWalletData({
        walletId: walletId,
        ownerAddress: walletOwnerAddress,
        balance: walletBalance,
        membersData: walletMembersAddresses.map((address, index) => ({
          address: address,
          firstName: walletMembersFirstNames[index],
          lastName: walletMembersLastNames[index],
        })),
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const CreateVault = ({ initialAddress }) => {
  // We're using Checksum algorithm to store ETH addresses in their original casing, in order to avoid sending lower-cased addresses to the blockchain
  const util = require("ethereumjs-util");
  const [walletName, setWalletName] = React.useState("");
  const [walletBalance, setWalletBalance] = React.useState("");
  const [ethAddress, setEthAddress] = React.useState("");
  const [membersAddresses, setMembersAddresses] = React.useState([
    initialAddress,
  ]);
  const [membersFirstNames, setMembersFirstNames] = React.useState([""]);
  const [membersLastNames, setMembersLastNames] = React.useState([""]);
  const [membersWithdrawalLimits, setMembersWithdrawalLimits] = React.useState([""]);
  const [walletData, setWalletData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const isMetaMaskAvailable = typeof window !== "undefined" && window.ethereum;

  const initializeWalletName = (event) => {
    setWalletName(event.target.value);
  };

  const initializeWalletBalance = (event) => {
    setWalletBalance(event.target.value);
  };

  React.useEffect(() => {
    if (!isMetaMaskAvailable) return;

    window.ethereum.on("accountsChanged", (addresses) => {
      //Disconnecting the last connected account on Metamask redirects the user to the login page
      if (addresses.length == 0) {
        router.push("/Login");
      } else {
        //Update the "owner" input field whenever the address changes
        setMembersAddresses((prevAddresses) => [
          addresses[0],
          ...prevAddresses.slice(1),
        ]);
        //Update the state whenever the address changes
        setEthAddress(util.toChecksumAddress(addresses[0]));
      }
    });

    //Update the state when the user logs in
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (addresses) => {
        setEthAddress(util.toChecksumAddress(addresses[0]));
      });
  }, [isMetaMaskAvailable]);

  React.useEffect(() => {
    initializeBlockchain();
    getData();
  }, [ethAddress]);

  const createTheWallet = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {

        let auxArray = Array(membersWithdrawalLimits.length);
        for (let i = 0; i < membersWithdrawalLimits.length; i++) {
          if (membersWithdrawalLimits[i] != "" && membersWithdrawalLimits[i] > 0) {
            auxArray[i] = ethers.utils.parseEther(membersWithdrawalLimits[i]);
          }
        }


        const vault = await contract.initializeWallet(
          walletName,
          membersAddresses,
          membersFirstNames,
          membersLastNames,
          auxArray,
          {
            value: ethers.utils.parseEther(walletBalance),
          }
        );

        console.log("creating the wallet..");
        setIsLoading(true);
        await vault.wait();
        getData();

        console.log("mined ", vault.hash);
        console.log("Wallet created!");

      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getData = async () => {
    setIsLoading(true);
    const data = await getWalletData(
      ethAddress == "" ? initialAddress : ethAddress,
      setWalletData
    );
    setIsLoading(false);
    if (walletData != null) {
      setIsLoading(false);
    }
  };

  const handleAddInput = () => {
    setMembersAddresses([...membersAddresses, ""]);
    setMembersFirstNames([...membersFirstNames, ""]);
    setMembersLastNames([...membersLastNames, ""]);
    setMembersWithdrawalLimits([...membersWithdrawalLimits, ""]);
  };

  const handleRemoveInput = () => {
    if (membersAddresses.length > 1) {
      setMembersAddresses(membersAddresses.slice(0, -1));
      setMembersFirstNames(membersFirstNames.slice(0, -1));
      setMembersLastNames(membersLastNames.slice(0, -1));
      setMembersWithdrawalLimits(membersWithdrawalLimits.slice(0, -1));
    }
  };

  const handleChangeWithdrawalLimit = (e, index) => {
    const values = [...membersWithdrawalLimits];
    values[index] = e.target.value;
    setMembersWithdrawalLimits(values);
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


        return isLoading ? (
    <h5>"Loading..."</h5>
  ) : (
    <div>
      {walletData.walletId != 0 ? (
        <div>
          <p>
            You can not create a wallet since you're a member of another wallet
          </p>
          <Link href="/">
            <button>Go to the home page</button>
          </Link>
        </div>
      ) : (
        <div>
          <h1>Welcome to the Vault</h1>
          <input
            type="text"
            placeholder="Type wallet's name..."
            value={walletName}
            onChange={initializeWalletName}
          />
          <button onClick={handleAddInput}>Add New Member</button>
          {
            membersAddresses.length > 1 ? (<button onClick={handleRemoveInput}>Remove Member</button>) : null
          }
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {membersAddresses.map((input, index) =>
                index == 0 ? (
                  <input
                    key={index}
                    type="text"
                    value={membersAddresses[0]}
                    readOnly
                  />
                ) : (
                  <input
                    key={index}
                    type="text"
                    placeholder="Type user' address..."
                    value={input.value}
                    onChange={(e) => handleChangeAddresses(e, index)}
                  />
                )
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {membersFirstNames.map((input, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="Type user' first name..."
                  value={membersFirstNames[index]}
                  onChange={(e) => handleChangeFirstNames(e, index)}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {membersLastNames.map((input, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="Type users' last name..."
                  value={membersLastNames[index]}
                  onChange={(e) => handleChangeLastNames(e, index)}
                />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {membersWithdrawalLimits.map((input, index) => (
                <input
                  key={index}
                  type="number"
                  placeholder="Type users' daily withdrawal limit..."
                  value={membersWithdrawalLimits[index]}
                  onChange={(e) => handleChangeWithdrawalLimit(e, index)}
                />
              ))}
            </div>
          </div>
          <input
            type="number"
            placeholder="Set wallet's balance..."
            value={walletBalance}
            onChange={initializeWalletBalance}
          />
          <div>
            <button onClick={createTheWallet}>Create the wallet</button>
          </div>
          <div>
            <Link href="/">
              <button>Go to the home page</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

CreateVault.getInitialProps = async ({ query }) => {
  const initialAddress = query.initialAddress || null;

  return { initialAddress };
};

export default CreateVault;
