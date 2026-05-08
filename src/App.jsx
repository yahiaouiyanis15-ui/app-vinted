import { useState } from "react";

const MAX_GRATUIT = 3;
const CODES_PROMO = ["AX7K9-VINTED-M2P4Q","BF3N8-VINTED-J6R1W","CQ5T2-VINTED-H9L7E","DM8Y6-VINTED-K3N5X","EP2W4-VINTED-G7T8Z","FR9K1-VINTED-B4M6V","GH6J3-VINTED-N2P9Y","HN4X7-VINTED-C8R5T","IQ1M5-VINTED-F6W3K","JB8T9-VINTED-L2X7P","KW3R6-VINTED-D5N4Q","LY7P2-VINTED-M9K1E","MG5N8-VINTED-R3T6Z","NX2K4-VINTED-W7B9V","OT9J1-VINTED-H4L5Y","PQ6W3-VINTED-C8M2X","RF4B7-VINTED-G1N9K","SK8Y5-VINTED-J6T3P","TH1M9-VINTED-B4R7Q","UJ3P6-VINTED-F2W8E","VL7K2-VINTED-N5X4Z","WN4T8-VINTED-M1B6V","XQ9R3-VINTED-K7L2Y","YB6W5-VINTED-D3N8T","ZF2M7-VINTED-R9P4X","AC8J4-VINTED-G5T1K","BD5N1-VINTED-W6M3Q","CE3T6-VINTED-H2R9Z","DG7K8-VINTED-B4L5V","EH1W2-VINTED-N7X6Y"];

function App() {
  const [description, setDescription] = useState("");
  const [plateforme, setPlateforme] = useState("Vinted");
  const [ton, setTon] = useState("neutre");
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [compteur, setCompteur] = useState(() => parseInt(localStorage.getItem("compteur") || "0"));
  const [historique, setHistorique] = useState(() => JSON.parse(localStorage.getItem("historique") || "[]"));
  const [copie, setCopie] = useState(false);
  const [onglet, setOnglet] = useState("generateur");
  const [codePromo, setCodePromo] = useState("");
  const [codeActif, setCodeActif] = useState(() => localStorage.getItem("codeActif") === "true");
  const [messageCode, setMessageCode] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mode, setMode] = useState("texte");

  // Optimiseur
  const [titreExistant, setTitreExistant] = useState("");
  const [descExistante, setDescExistante] = useState("");
  const [prixExistant, setPrixExistant] = useState("");
  const [resultatOptimise, setResultatOptimise] = useState(null);
  const [loadingOptimise, setLoadingOptimise] = useState(false);
  const [erreurOptimise, setErreurOptimise] = useState("");
  const [copieOptimise, setCopieOptimise] = useState(false);

  const estGratuit = compteur < MAX_GRATUIT;
  const peutGenerer = estGratuit || codeActif;

  const activerCode = () => {
    if (CODES_PROMO.includes(codePromo.toUpperCase().trim())) {
      setCodeActif(true);
      localStorage.setItem("codeActif", "true");
      setMessageCode("✅ Code activé ! Accès illimité débloqué !");
    } else {
      setMessageCode("❌ Code invalide, réessaie !");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setImage({ data: base64, type: file.type });
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generer = async () => {
    if (mode === "texte" && !description.trim()) { setErreur("Decris ton article !"); return; }
    if (mode === "photo" && !image) { setErreur("Ajoute une photo !"); return; }
    if (!peutGenerer) { setErreur("Limite gratuite atteinte ! Abonne-toi pour continuer."); return; }
    setLoading(true);
    setErreur("");
    setResultat(null);
    try {
      const response = await fetch("https://app-vinted.onrender.com/api/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, plateforme, ton, image: mode === "photo" ? image : null }),
      });
      const data = await response.json();
      if (data.erreur) {
        setErreur(data.erreur);
      } else {
        setResultat(data);
        if (!codeActif) {
          const newCompteur = compteur + 1;
          setCompteur(newCompteur);
          localStorage.setItem("compteur", newCompteur);
        }
        const newHistorique = [{ date: new Date().toLocaleDateString(), plateforme, description: mode === "photo" ? "📷 Analyse photo" : description, ...data }, ...historique].slice(0, 10);
        setHistorique(newHistorique);
        localStorage.setItem("historique", JSON.stringify(newHistorique));
      }
    } catch (e) {
      setErreur("Erreur de connexion au serveur.");
    }
    setLoading(false);
  };

  const optimiser = async () => {
    if (!titreExistant.trim() && !descExistante.trim()) { setErreurOptimise("Colle ton annonce existante !"); return; }
    if (!peutGenerer) { setErreurOptimise("Limite gratuite atteinte ! Abonne-toi pour continuer."); return; }
    setLoadingOptimise(true);
    setErreurOptimise("");
    setResultatOptimise(null);
    try {
      const response = await fetch("https://app-vinted.onrender.com/api/optimiser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titre: titreExistant, description: descExistante, prix: prixExistant, plateforme }),
      });
      const data = await response.json();
      if (data.erreur) {
        setErreurOptimise(data.erreur);
      } else {
        setResultatOptimise(data);
        if (!codeActif) {
          const newCompteur = compteur + 1;
          setCompteur(newCompteur);
          localStorage.setItem("compteur", newCompteur);
        }
      }
    } catch (e) {
      setErreurOptimise("Erreur de connexion au serveur.");
    }
    setLoadingOptimise(false);
  };

  const copierAnnonce = () => {
    if (!resultat) return;
    const texte = `${resultat.titre}\n\n${resultat.description}\n\nPrix : ${resultat.prix}€\n\nMots-clés : ${resultat.mots_cles?.join(", ")}`;
    navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const copierAnnonceOptimisee = () => {
    if (!resultatOptimise) return;
    const texte = `${resultatOptimise.titre_optimise}\n\n${resultatOptimise.description_optimisee}\n\nPrix : ${resultatOptimise.prix_optimise}€\n\nMots-clés : ${resultatOptimise.mots_cles?.join(", ")}`;
    navigator.clipboard.writeText(texte);
    setCopieOptimise(true);
    setTimeout(() => setCopieOptimise(false), 2000);
  };

  const couleurConcurrence = (c) => {
    if (!c) return "#888";
    if (c.toLowerCase() === "faible") return "#4CAF50";
    if (c.toLowerCase() === "moyenne") return "#ff9900";
    return "#ff4444";
  };

  const couleurScore = (s) => {
    if (s > 7) return "#4CAF50";
    if (s >= 5) return "#ff9900";
    return "#ff4444";
  };

  const formatPlateforme = (p) => {
    if (!p) return "";
    const lower = p.toLowerCase();
    if (lower === "les deux" || lower === "vinted et leboncoin") return "Vinted et Leboncoin";
    return p;
  };

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", fontFamily: "Arial", padding: 20, minHeight: "100vh" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#09B1BA", margin: 0, fontSize: 28 }}>🛍️ AnnonceAI</h1>
        <p style={{ color: "#888", margin: "4px 0 0" }}>Génère des annonces qui vendent en 5 secondes</p>
      </div>

      {codeActif ? (
        <div style={{ backgroundColor: "#e8f8f8", border: "1px solid #09B1BA", borderRadius: 10, padding: "10px 16px", marginBottom: 20, textAlign: "center" }}>
          <span style={{ color: "#09B1BA", fontWeight: "bold" }}>💎 Accès Premium — Annonces illimitées !</span>
        </div>
      ) : (
        <div style={{ backgroundColor: estGratuit ? "#e8f8f8" : "#fff0f0", border: `1px solid ${estGratuit ? "#09B1BA" : "#ff4444"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: estGratuit ? 0 : 10 }}>
            <span style={{ color: estGratuit ? "#09B1BA" : "#ff4444", fontWeight: "bold" }}>
              {estGratuit ? `✅ ${MAX_GRATUIT - compteur} annonce(s) gratuite(s) restante(s)` : "🔒 Limite atteinte — Abonne-toi !"}
            </span>
            {!estGratuit && (
              <button onClick={() => window.open("TONLIENSTRIPE", "_blank")} style={{ backgroundColor: "#ff9900", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: "bold" }}>
                S'abonner 4,99€/mois
              </button>
            )}
          </div>
          {!estGratuit && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={codePromo} onChange={(e) => setCodePromo(e.target.value)} placeholder="Tu as un code promo ?" style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
              <button onClick={activerCode} style={{ backgroundColor: "#09B1BA", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: "bold" }}>
                Activer
              </button>
            </div>
          )}
          {messageCode && <p style={{ color: messageCode.includes("✅") ? "green" : "red", margin: "8px 0 0", fontSize: 14 }}>{messageCode}</p>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["generateur", "optimiseur", "historique"].map(o => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", backgroundColor: onglet === o ? "#09B1BA" : "#eee", color: onglet === o ? "white" : "#333", fontSize: 13 }}>
            {o === "generateur" ? "✨ Générateur" : o === "optimiseur" ? "🔧 Optimiseur" : "📋 Historique"}
          </button>
        ))}
      </div>

      {onglet === "generateur" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Plateforme</label>
            <select value={plateforme} onChange={(e) => setPlateforme(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, color: "white", backgroundColor: "#333" }}>
              <option style={{ color: "white", backgroundColor: "#333" }}>Vinted</option>
              <option style={{ color: "white", backgroundColor: "#333" }}>Leboncoin</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Ton de l'annonce</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["neutre", "😐 Neutre"], ["urgent", "🔥 Urgent"], ["luxe", "💎 Luxe"], ["decontracte", "😎 Décontracté"]].map(([val, label]) => (
                <button key={val} onClick={() => setTon(val)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `2px solid ${ton === val ? "#09B1BA" : "#ddd"}`, backgroundColor: ton === val ? "#e8f8f8" : "white", cursor: "pointer", fontSize: 13, fontWeight: ton === val ? "bold" : "normal", color: "#333" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Mode</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode("texte")} style={{ flex: 1, padding: 10, borderRadius: 8, border: `2px solid ${mode === "texte" ? "#09B1BA" : "#ddd"}`, backgroundColor: mode === "texte" ? "#e8f8f8" : "white", cursor: "pointer", fontWeight: "bold", color: "#333" }}>
                ✏️ Description texte
              </button>
              <button onClick={() => setMode("photo")} style={{ flex: 1, padding: 10, borderRadius: 8, border: `2px solid ${mode === "photo" ? "#09B1BA" : "#ddd"}`, backgroundColor: mode === "photo" ? "#e8f8f8" : "white", cursor: "pointer", fontWeight: "bold", color: "#333" }}>
                📷 Analyser une photo
              </button>
            </div>
          </div>

          {mode === "texte" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Décris ton article</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Jean Levis 501 taille 40, bleu, tres bon etat, porte 2 fois..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", height: 110, resize: "vertical", fontSize: 14, boxSizing: "border-box", color: "white", backgroundColor: "#333" }} />
            </div>
          )}

          {mode === "photo" && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Ajoute une photo de ton article</label>
              <input type="file" accept="image/*" onChange={handleImage} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", backgroundColor: "#333", color: "white", boxSizing: "border-box" }} />
              {imagePreview && (
                <div style={{ marginTop: 10, textAlign: "center" }}>
                  <img src={imagePreview} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "2px solid #09B1BA" }} />
                </div>
              )}
            </div>
          )}

          {erreur && <p style={{ color: "red", marginBottom: 10 }}>{erreur}</p>}

          <button onClick={generer} disabled={loading || !peutGenerer} style={{ width: "100%", padding: 14, backgroundColor: peutGenerer ? "#09B1BA" : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: peutGenerer ? "pointer" : "not-allowed", fontWeight: "bold", marginBottom: 20 }}>
            {loading ? "⏳ Analyse en cours..." : mode === "photo" ? "📷 Analyser la photo" : "✨ Générer mon annonce"}
          </button>

          {resultat && (
            <div style={{ marginTop: 10 }}>
              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ color: "#09B1BA", margin: 0 }}>✅ Ton annonce</h3>
                  <button onClick={copierAnnonce} style={{ backgroundColor: copie ? "#4CAF50" : "#09B1BA", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: "bold" }}>
                    {copie ? "✅ Copié !" : "📋 Copier"}
                  </button>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: "bold", color: "#333" }}>📌 Titre</label>
                  <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", color: "#333" }}>{resultat.titre}</p>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: "bold", color: "#333" }}>📝 Description</label>
                  <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", lineHeight: 1.6, color: "#333" }}>{resultat.description}</p>
                </div>
                <div>
                  <label style={{ fontWeight: "bold", color: "#333" }}>🏷️ Mots-clés</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {Array.isArray(resultat.mots_cles) && resultat.mots_cles.map((mot, i) => (
                      <span key={i} style={{ backgroundColor: "#09B1BA", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 14 }}>{mot}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <h3 style={{ color: "#09B1BA", margin: "0 0 12px" }}>🏆 Score de l'annonce</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: couleurScore(resultat.score), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: "bold", flexShrink: 0 }}>
                    {resultat.score}/10
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#333", fontWeight: "bold" }}>Points forts :</p>
                    {Array.isArray(resultat.points_forts) && resultat.points_forts.map((p, i) => (
                      <p key={i} style={{ margin: "2px 0", color: "#4CAF50", fontSize: 13 }}>✅ {p}</p>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, color: "#333", fontWeight: "bold" }}>À améliorer :</p>
                {Array.isArray(resultat.points_amelioration) && resultat.points_amelioration.map((p, i) => (
                  <p key={i} style={{ margin: "2px 0", color: "#ff9900", fontSize: 13 }}>⚠️ {p}</p>
                ))}
              </div>

              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <h3 style={{ color: "#09B1BA", margin: "0 0 12px" }}>📊 Analyse du marché</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Concurrence</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: couleurConcurrence(resultat.concurrence) }}>{resultat.concurrence}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Délai de vente estimé</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#333" }}>⏱️ {resultat.delai_vente}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Meilleur moment</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#333" }}>📅 {resultat.meilleur_moment}</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Meilleure plateforme</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#09B1BA" }}>🛒 {formatPlateforme(resultat.meilleure_plateforme)}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <h3 style={{ color: "#09B1BA", margin: "0 0 12px" }}>💰 Optimisation du prix</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "2px solid #09B1BA", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Prix suggéré</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#09B1BA", fontSize: 20 }}>{resultat.prix} €</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Prix psychologique</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#333", fontSize: 18 }}>{resultat.prix_psychologique} €</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Fourchette</p>
                    <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#333" }}>{resultat.prix_min}€ — {resultat.prix_max}€</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <h3 style={{ color: "#09B1BA", margin: "0 0 12px" }}>📸 Conseils photos</h3>
                {Array.isArray(resultat.photos) && resultat.photos.map((p, i) => (
                  <p key={i} style={{ margin: "4px 0", color: "#333", fontSize: 14 }}>📷 {p}</p>
                ))}
              </div>

              <div style={{ padding: 16, backgroundColor: "#fff0f0", borderRadius: 12, border: "1px solid #ffcccc", marginBottom: 16 }}>
                <h3 style={{ color: "#ff4444", margin: "0 0 12px" }}>⚠️ Erreurs à éviter</h3>
                {Array.isArray(resultat.erreurs) && resultat.erreurs.map((e, i) => (
                  <p key={i} style={{ margin: "4px 0", color: "#333", fontSize: 14 }}>❌ {e}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {onglet === "optimiseur" && (
        <>
          <div style={{ padding: 16, backgroundColor: "#e8f8f8", borderRadius: 12, border: "1px solid #09B1BA", marginBottom: 20 }}>
            <p style={{ margin: 0, color: "#09B1BA", fontWeight: "bold" }}>🔧 Colle ton annonce existante et on l'améliore pour toi !</p>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Plateforme</label>
            <select value={plateforme} onChange={(e) => setPlateforme(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, color: "white", backgroundColor: "#333" }}>
              <option style={{ color: "white", backgroundColor: "#333" }}>Vinted</option>
              <option style={{ color: "white", backgroundColor: "#333" }}>Leboncoin</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Titre actuel</label>
            <input value={titreExistant} onChange={(e) => setTitreExistant(e.target.value)} placeholder="Ex: Jean bleu" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, color: "white", backgroundColor: "#333", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Description actuelle</label>
            <textarea value={descExistante} onChange={(e) => setDescExistante(e.target.value)} placeholder="Colle ta description actuelle ici..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", height: 110, resize: "vertical", fontSize: 14, boxSizing: "border-box", color: "white", backgroundColor: "#333" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Prix actuel (€)</label>
            <input value={prixExistant} onChange={(e) => setPrixExistant(e.target.value)} placeholder="Ex: 25" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 14, color: "white", backgroundColor: "#333", boxSizing: "border-box" }} />
          </div>

          {erreurOptimise && <p style={{ color: "red", marginBottom: 10 }}>{erreurOptimise}</p>}

          <button onClick={optimiser} disabled={loadingOptimise || !peutGenerer} style={{ width: "100%", padding: 14, backgroundColor: peutGenerer ? "#09B1BA" : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: peutGenerer ? "pointer" : "not-allowed", fontWeight: "bold", marginBottom: 20 }}>
            {loadingOptimise ? "⏳ Optimisation en cours..." : "🔧 Optimiser mon annonce"}
          </button>

          {resultatOptimise && (
            <div style={{ marginTop: 10 }}>

              {/* Score avant/après */}
              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <h3 style={{ color: "#09B1BA", margin: "0 0 12px" }}>📈 Amélioration</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 55, height: 55, borderRadius: "50%", backgroundColor: couleurScore(resultatOptimise.score_avant), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>
                      {resultatOptimise.score_avant}/10
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>Avant</p>
                  </div>
                  <div style={{ fontSize: 24 }}>→</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 55, height: 55, borderRadius: "50%", backgroundColor: couleurScore(resultatOptimise.score_apres), display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>
                      {resultatOptimise.score_apres}/10
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>Après</p>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#333", fontWeight: "bold" }}>Problèmes détectés :</p>
                {Array.isArray(resultatOptimise.problemes) && resultatOptimise.problemes.map((p, i) => (
                  <p key={i} style={{ margin: "2px 0", color: "#ff4444", fontSize: 13 }}>❌ {p}</p>
                ))}
                <p style={{ margin: "10px 0 4px", color: "#333", fontWeight: "bold" }}>Améliorations apportées :</p>
                {Array.isArray(resultatOptimise.ameliorations) && resultatOptimise.ameliorations.map((a, i) => (
                  <p key={i} style={{ margin: "2px 0", color: "#4CAF50", fontSize: 13 }}>✅ {a}</p>
                ))}
              </div>

              {/* Annonce optimisée */}
              <div style={{ padding: 16, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ color: "#09B1BA", margin: 0 }}>✅ Annonce optimisée</h3>
                  <button onClick={copierAnnonceOptimisee} style={{ backgroundColor: copieOptimise ? "#4CAF50" : "#09B1BA", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: "bold" }}>
                    {copieOptimise ? "✅ Copié !" : "📋 Copier"}
                  </button>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: "bold", color: "#333" }}>📌 Nouveau titre</label>
                  <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", color: "#333" }}>{resultatOptimise.titre_optimise}</p>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: "bold", color: "#333" }}>📝 Nouvelle description</label>
                  <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", lineHeight: 1.6, color: "#333" }}>{resultatOptimise.description_optimisee}</p>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: "bold", color: "#333" }}>💰 Nouveau prix</label>
                  <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", fontSize: 20, fontWeight: "bold", color: "#09B1BA" }}>{resultatOptimise.prix_optimise} € <span style={{ fontSize: 14, color: "#888" }}>(psychologique : {resultatOptimise.prix_psychologique}€)</span></p>
                </div>
                <div>
                  <label style={{ fontWeight: "bold", color: "#333" }}>🏷️ Mots-clés</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {Array.isArray(resultatOptimise.mots_cles) && resultatOptimise.mots_cles.map((mot, i) => (
                      <span key={i} style={{ backgroundColor: "#09B1BA", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 14 }}>{mot}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {onglet === "historique" && (
        <div>
          {historique.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>Aucune annonce générée pour l'instant</p>
          ) : (
            historique.map((item, i) => (
              <div key={i} style={{ padding: 14, backgroundColor: "#f9f9f9", borderRadius: 10, border: "1px solid #ddd", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: "bold", color: "#09B1BA" }}>{item.titre}</span>
                  <span style={{ color: "#888", fontSize: 12 }}>{item.date} • {item.plateforme}</span>
                </div>
                <p style={{ margin: 0, color: "#555", fontSize: 14 }}>{item.description}</p>
                <span style={{ color: "#09B1BA", fontWeight: "bold" }}>{item.prix} €</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;