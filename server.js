const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Base de données en mémoire (pour Render)
// IMPORTANT : Les données sont perdues au redémarrage
// Pour du permanent, utilise une vraie BDD
let usersData = {
  users: [
    {
      robloxUserId: 8930788286,
      firstName: "Lucas",
      lastName: "Admin",
      discord: "lucas#0000",
      rank: "Administrateur",
      photoUrl: ""
    }
  ]
};

// ═══════════════════════════════════════════════════════════
//                    PAGE D'ACCUEIL
// ═══════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  const host = req.get('host');
  const apiUrl = `https://${host}/api/checkuser`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>API Sécurité Roblox</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 15px;
          padding: 40px;
          max-width: 600px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        .logo { font-size: 60px; margin-bottom: 20px; }
        h1 { color: #333; }
        .status {
          display: inline-block;
          background: #4caf50;
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          margin: 20px 0;
        }
        .info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          text-align: left;
        }
        code {
          background: #e0e0e0;
          padding: 4px 8px;
          border-radius: 4px;
          word-break: break-all;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🔐</div>
        <h1>API Système de Sécurité</h1>
        <p>Pour votre jeu Roblox</p>
        <div class="status">✓ En ligne</div>
        <div class="info">
          <h3>📡 URL de l'API</h3>
          <code>${apiUrl}</code>
        </div>
        <div class="info">
          <h3>🔧 Configuration Roblox</h3>
          <p>Dans SecuritySystem :</p>
          <code>local API_URL = "${apiUrl}"</code>
        </div>
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Propulsé par Render • v1.0
        </p>
      </div>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════
//                    API CHECK USER
// ═══════════════════════════════════════════════════════════

app.post('/api/checkuser', (req, res) => {
  const { userId, username } = req.body;
  
  console.log('📥 Requête:', { userId, username });
  
  if (!userId || !username) {
    return res.status(400).json({
      authorized: false,
      error: 'Données manquantes'
    });
  }
  
  const user = usersData.users.find(u => u.robloxUserId == userId);
  
  if (user) {
    console.log('✅ Autorisé:', username);
    return res.json({
      authorized: true,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        discord: user.discord || '',
        rank: user.rank || '',
        photoUrl: user.photoUrl || ''
      }
    });
  } else {
    console.log('❌ Refusé:', username);
    return res.json({
      authorized: false,
      userData: null
    });
  }
});

// Test GET
app.get('/api/checkuser', (req, res) => {
  res.json({
    status: 'online',
    message: 'Utilisez POST pour vérifier',
    totalUsers: usersData.users.length
  });
});

// ═══════════════════════════════════════════════════════════
//                    GESTION UTILISATEURS
// ═══════════════════════════════════════════════════════════

// Ajouter un utilisateur (protection basique)
app.post('/admin/adduser', (req, res) => {
  const { password, user } = req.body;
  
  // ⚠️ Change ce mot de passe !
  if (password !== 'admin1409') {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  
  usersData.users.push(user);
  res.json({ success: true, totalUsers: usersData.users.length });
});

// Voir tous les utilisateurs
app.get('/admin/users', (req, res) => {
  res.json(usersData);
});

// ═══════════════════════════════════════════════════════════
//                    DÉMARRAGE
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log('✅ API prête !');
  console.log(`👥 ${usersData.users.length} utilisateur(s) autorisé(s)`);
  console.log('═══════════════════════════════════════');
});
