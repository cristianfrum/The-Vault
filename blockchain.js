import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "/global";

let provider;
let signer;
let contract;

export async function initializeBlockchain() {
  const { ethereum } = window;
  if(ethereum) {
    if (typeof window.ethereum !== "undefined") {
    // Create a provider using the Web3Provider from ethers.js
    provider = new ethers.providers.Web3Provider(window.ethereum);
    // Get the signer from the provider
    signer = provider.getSigner();
    // Create a contract instance using the CONTRACT_ADDRESS and CONTRACT_ABI
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } else {
    throw new Error("Please install MetaMask or another Ethereum wallet");
  }
}
  }

export { contract };