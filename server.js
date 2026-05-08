const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
app.post('/api/generer', async (req, res) => {
const { description, plateforme, ton } = req.body;  
  try {
    const Anthropic = require('@anthropic-ai/sdk');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en vente sur ${plateforme}. Ton de l'annonce : ${ton}. Genere une annonce pour : "${description}". Reponds UNIQUEMENT avec ce JSON : {"titre":"titre court","description":"description vendeuse","prix":"prix en euros","mots_cles":["mot1","mot2","mot3"]}`
        }
      ]
    });

    const texte = message.content[0].text;
    console.log('Reponse:', texte);
    const json = JSON.parse(texte.replace(/```json|```/g, '').trim());
    res.json(json);
  } catch (error) {
    console.log('ERREUR:', error.message);
    res.status(500).json({ erreur: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Serveur demarre sur le port ' + PORT));