const { ethers } = require("ethers");

// Initialiser le fournisseur BSC
provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

// Adresse à vérifier
let address = "0xEC0CF7505c86E0ea33A2f2dE4660E6A06abE92Dd";

try {
  // Vérification et conversion de l'adresse en format checksum
  address = ethers.utils.getAddress(address);
  console.log(`Adresse validée : ${address}`);
} catch (error) {
  console.error("Adresse invalide :", error.message);
  process.exit(1); // Arrêter le script si l'adresse est invalide
}

const checkBalance = async () => {
  try {
    const balance = await provider.getBalance(address);
    console.log(`Balance de l'adresse ${address}: ${ethers.utils.formatEther(balance)} BNB`);
  } catch (error) {
    console.error("Erreur lors de la vérification du solde :", error);
  }
};

checkBalance();