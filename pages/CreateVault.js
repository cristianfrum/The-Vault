import React from 'react'
import Link from 'next/link';

const CreateVault = () => {
  const [inputValue, setInputValue] = React.useState('');

  const setWalletName = (event) => {
    setInputValue(event.target.value);
  };

  const createTheVault = async () => {

  }

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Welcome to the Vault</h1>
      <input type="text" value={inputValue} onChange={setWalletName} />
      <button>Create the vault</button>
      <Link href="/">
        <button>Go to the home page</button>
      </Link>
    </div>)

}
export default CreateVault;