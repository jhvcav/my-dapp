import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function App() {
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [plans, setPlans] = useState([]); // Historique des plans
  const [montants, setMontants] = useState({}); // Montants pour chaque plan
  const [loading, setLoading] = useState(false);
  const [planInvestissements, setPlanInvestissements] = useState({});
  const [reinvestissementAutomatique, setReinvestissementAutomatique] = useState(false);
  const [bnbToUsdtRate, setBnbToUsdtRate] = useState(300); // Exemple: 1 BNB = 300 USDT (taux fictif)

  const contractAddress = "0xCB224BDd5125E04E8E5EbbC97ba1d900e6CA8d3c";

  const contractABI = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_tauxRendement",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_dureeBlocage",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        }
      ],
      "name": "DepotEffectue",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        }
      ],
      "name": "FondsRetiresParProprietaire",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "debut",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fin",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "taux",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "reinvestissementAutomatique",
          "type": "bool"
        }
      ],
      "name": "PlanAjoute",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        }
      ],
      "name": "RendementsRetires",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        }
      ],
      "name": "RetraitEffectue",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "montant",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "taux",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "duree",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "reinvestissementAutomatique",
          "type": "bool"
        }
      ],
      "name": "ajouterPlan",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "deposer",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "nouvelleDuree",
          "type": "uint256"
        }
      ],
      "name": "mettreAJourDureeBlocage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "nouveauTaux",
          "type": "uint256"
        }
      ],
      "name": "mettreAJourTauxRendement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        }
      ],
      "name": "obtenirDepot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "obtenirDureeBlocage",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        }
      ],
      "name": "obtenirPlansUtilisateur",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "montant",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "debut",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "fin",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "taux",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "reinvestissementAutomatique",
              "type": "bool"
            }
          ],
          "internalType": "struct Rendement.Plan[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "utilisateur",
          "type": "address"
        }
      ],
      "name": "obtenirRendement",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "obtenirTauxRendement",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retirer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retirerRendements",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retirerTout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];

  const plansDisponibles = [
    { id: 1, nom: "Plan 1", duree: 7, taux: 0.5 },
    { id: 2, nom: "Plan 2", duree: 30, taux: 0.7 },
    { id: 3, nom: "Plan 3", duree: 90, taux: 0.8 },
    { id: 4, nom: "Plan 4", duree: 180, taux: 0.9 },
  ];

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          setSigner(signer);
          setContract(contract);

          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);

          const balance = await contract.getBalance();
          const balanceInUsdt = (parseFloat(ethers.utils.formatEther(balance)) * bnbToUsdtRate).toFixed(2);
          setBalance(balanceInUsdt);

          const storedPlans = JSON.parse(localStorage.getItem("historiquePlans")) || [];
          setPlans(storedPlans);

          // Charger les investissements par plan
          const investments = {};
          plansDisponibles.forEach((plan) => {
            investments[plan.id] = {
              totalInvesti: storedPlans
                .filter((p) => p.nom === plan.nom)
                .reduce((acc, curr) => acc + parseFloat(curr.montant), 0),
              rendement: storedPlans
                .filter((p) => p.nom === plan.nom)
                .reduce((acc, curr) => acc + curr.montant * (plan.taux / 100), 0),
            };
          });
          setPlanInvestissements(investments);
        } catch (error) {
          console.error("Erreur lors de l'initialisation :", error);
        }
      } else {
        alert("Veuillez installer Metamask !");
      }
    };

    init();
  }, [bnbToUsdtRate]);

  const handleInvest = async (plan) => {
    const montant = montants[plan.id] || "";
    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0) {
      alert("Veuillez entrer un montant valide !");
      return;
    }
    const montantInBnb = parseFloat(montant) / bnbToUsdtRate; // Conversion en BNB
    if (contract && signer) {
      try {
        setLoading(true);
        const tx = await contract.deposer({
          value: ethers.utils.parseEther(montantInBnb.toString()),
        });
        await tx.wait();
        alert(`Investissement dans ${plan.nom} effectué !`);

        const nouveauPlan = {
          nom: plan.nom,
          montant: parseFloat(montant),
          debut: new Date().toISOString(),
          fin: new Date(new Date().getTime() + plan.duree * 24 * 60 * 60 * 1000).toISOString(),
          taux: plan.taux,
          reinvestissementAutomatique,
        };

        const updatedPlans = [...plans, nouveauPlan];
        setPlans(updatedPlans);
        localStorage.setItem("historiquePlans", JSON.stringify(updatedPlans));

        setPlanInvestissements((prevInvestments) => ({
          ...prevInvestments,
          [plan.id]: {
            totalInvesti: (prevInvestments[plan.id]?.totalInvesti || 0) + parseFloat(montant),
            rendement: (prevInvestments[plan.id]?.rendement || 0) + parseFloat(montant) * (plan.taux / 100),
          },
        }));

        setMontants((prevMontants) => ({ ...prevMontants, [plan.id]: "" }));
      } catch (error) {
        alert("Erreur lors de l'investissement !");
        console.error("Erreur lors de l'investissement :", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const retirerRendement = async (plan) => {
    if (contract && signer) {
      try {
        setLoading(true);
        const tx = await contract.retirerRendements(); // Appel à la fonction retirerRendements
        await tx.wait();
        alert(`Rendement retiré avec succès pour le plan : ${plan.nom}`);
      } catch (error) {
        console.error("Erreur lors du retrait des rendements :", error);
        alert("Erreur lors du retrait des rendements !");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Le contrat ou le portefeuille n'est pas connecté !");
    }
  };

  const retirerCapital = (plan) => {
    alert(`Capital retiré pour ${plan.nom}`);
  };

  const calculerStatutPlan = (plan) => {
    const maintenant = new Date();
    const dateFin = new Date(plan.fin);
    return maintenant >= dateFin ? "Terminé" : "En cours";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", color: "#4CAF50" }}>Interface DApp - Contrat Rendement</h1>
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <p><strong>Adresse connectée :</strong> {account}</p>
        <p><strong>Solde du contrat :</strong> {balance} USDT</p>
      </div>

      <h2 style={{ textAlign: "center", color: "#4CAF50" }}>Plans Disponibles</h2>
      <div>
        {plansDisponibles.map((plan) => (
          <div key={plan.id} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "5px" }}>
            <h3>{plan.nom}</h3>
            <p>Durée : {plan.duree} jours</p>
            <p>Taux : {plan.taux}%</p>
            <p>Montant total investi : {(planInvestissements[plan.id]?.totalInvesti || 0).toFixed(2)} USDT</p>
            <p>Rendement généré : {(planInvestissements[plan.id]?.rendement || 0).toFixed(2)} USDT</p>
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Montant à investir (USDT)"
                value={montants[plan.id] || ""}
                onChange={(e) => setMontants((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                style={{ padding: "10px", width: "80%" }}
              />
            </div>
            <label>
              Réinvestissement automatique
              <input
                type="checkbox"
                checked={reinvestissementAutomatique}
                onChange={(e) => setReinvestissementAutomatique(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>
            <button
              onClick={() => handleInvest(plan)}
              disabled={loading}
              style={{
                padding: "10px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                marginTop: "10px",
              }}
            >
              {loading ? "En cours..." : "Investir"}
            </button>
            <button
              onClick={() => retirerRendement(plan)}
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Retirer Rendement
            </button>
            <button
              onClick={() => retirerCapital(plan)}
              style={{
                marginTop: "10px",
                padding: "10px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Retirer Capital
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ textAlign: "center", color: "#4CAF50", marginTop: "40px" }}>Historique des Plans</h2>
      <div style={{ textAlign: "left", padding: "20px", background: "#f9f9f9", borderRadius: "10px" }}>
        {plans.length === 0 ? (
          <p>Aucun plan d'investissement pour l'instant.</p>
        ) : (
          <ul style={{ lineHeight: "2" }}>
            {plans.map((plan, index) => (
              <li key={index}>
                <strong>{plan.nom}</strong> - Montant: {plan.montant} USDT, Début: {new Date(plan.debut).toLocaleString()}, Fin: {new Date(plan.fin).toLocaleString()}, Taux: {plan.taux}% -
                <span style={{ color: calculerStatutPlan(plan) === "Terminé" ? "red" : "green", fontWeight: "bold", marginLeft: "5px" }}>
                  {calculerStatutPlan(plan)}
                </span> - Réinvestissement automatique: {plan.reinvestissementAutomatique ? "Oui" : "Non"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;