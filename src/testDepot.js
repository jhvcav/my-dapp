import { ethers } from "ethers";

console.log("testDepot.js est chargé");

const contractAddress = "0xCB224BDd5125E04E8E5EbbC97ba1d900e6CA8d3c";
const contractABI = [
  {
    inputs: [{ internalType: "address", name: "utilisateur", type: "address" }],
    name: "obtenirDepot",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const testDepot = async () => {
  console.log("Début du test de la fonction obtenirDepot...");

  if (!window.ethereum) {
    console.error("Metamask n'est pas installé !");
    return;
  }
  console.log("Metamask est installé.");

  try {
    console.log("Initialisation du fournisseur...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log("Fournisseur initialisé :", provider);

    const signer = provider.getSigner();
    console.log("Signer récupéré :", signer);

    console.log("Création du contrat...");
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    console.log("Contrat créé :", contract);

    console.log("Demande des comptes Metamask...");
    const accounts = await provider.send("eth_requestAccounts", []);
    const account = accounts[0];
    console.log("Compte connecté :", account);

    console.log("Appel à obtenirDepot pour le compte :", account);
    const depot = await contract.obtenirDepot(account);
    console.log("Dépôt récupéré :", ethers.utils.formatEther(depot), "BNB");
  } catch (error) {
    console.error("Erreur lors de l'appel à obtenirDepot :", error);
  }
};

// Vérifiez que la fonction est bien appelée
console.log("Appel de la fonction testDepot...");
testDepot();

export default testDepot;