const { ethers } = require("ethers");

console.log("Ethers.js version:", ethers.version);
const formattedEther = ethers.utils.formatEther("1000000000000000000"); // Convert wei to ETH
console.log("1 ETH in wei:", formattedEther);