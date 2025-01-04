const { ethers } = require("ethers");

const rawAddress = "0xEC0CF7505c86E0ea33A2f2dE4660E6A06abE92Dd";

try {
  const checksumAddress = ethers.utils.getAddress(rawAddress);
  console.log("Adresse validée avec checksum :", checksumAddress);
} catch (error) {
  console.error("Erreur : Adresse invalide ou format incorrect :", error.message);
}