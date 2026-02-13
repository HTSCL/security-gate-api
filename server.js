// ═══════════════════════════════════════════════════════════
//              SERVEUR API + PANNEAU ADMIN COMPLET
//              Pour Render.com ou Glitch
// ═══════════════════════════════════════════════════════════

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
//                      MIDDLEWARE
// ═══════════════════════════════════════════════════════════

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session pour l'authentification admin
app.use(session({
  secret: 'portique-securite-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24h
    secure: false // Mettre true en production avec HTTPS
  }
}));

// ═══════════════════════════════════════════════════════════
//                      BASE DE DONNÉES
// ═══════════════════════════════════════════════════════════

// Données en mémoire (remplacer par une vraie BDD si besoin)
let usersData = {
  users: [
    {
      id: 1,
      robloxUserId: 8930788286,
      firstName: "Lucas",
      lastName: "Admin",
      discord: "lucas#0000",
      rank: "Administrateur",
      photoUrl: "",
      addedBy: "System",
      addedAt: new Date().toISOString()
    }
  ]
};

// Compte admin (change le mot de passe !)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync("admin123", 10); // Change "admin123"

// Logs d'accès
let accessLogs = [];

// ═══════════════════════════════════════════════════════════
//                  MIDDLEWARE AUTH
// ═══════════════════════════════════════════════════════════

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// ═══════════════════════════════════════════════════════════
//                  PAGE D'ACCUEIL PUBLIQUE
// ═══════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  const host = req.get('host');
  const apiUrl = `https://${host}/api/checkuser`;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Système de Sécurité</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 60px 40px;
          text-align: center;
          max-width: 700px;
        }
        .logo { font-size: 80px; margin-bottom: 20px; }
        h1 { color: #333; margin-bottom: 15px; }
        p { color: #666; margin-bottom: 20px; line-height: 1.6; }
        .status {
          display: inline-block;
          padding: 8px 20px;
          background: #4caf50;
          color: white;
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        .info-box {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: left;
        }
        .info-box h3 { color: #667eea; margin-bottom: 10px; }
        code {
          background: #e0e0e0;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
          display: block;
          margin: 10px 0;
        }
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 10px;
          transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .stats {
          display: flex;
          justify-content: space-around;
          margin: 30px 0;
        }
        .stat { text-align: center; }
        .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
        .stat-label { color: #999; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🔐</div>
        <h1>Système de Sécurité Roblox</h1>
        <p>API de vérification d'accès pour votre jeu</p>
        
        <div class="status">✓ En ligne</div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-number">${usersData.users.length}</div>
            <div class="stat-label">Utilisateurs</div>
          </div>
          <div class="stat">
            <div class="stat-number">${accessLogs.length}</div>
            <div class="stat-label">Accès total</div>
          </div>
        </div>
        
        <div class="info-box">
          <h3>📡 URL de l'API</h3>
          <code>${apiUrl}</code>
        </div>
        
        <div class="info-box">
          <h3>🔧 Configuration Roblox</h3>
          <p>Dans SecuritySystem :</p>
          <code>local API_URL = "${apiUrl}"</code>
        </div>
        
        <a href="/admin/login" class="btn">🔑 Panneau Admin</a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #999;">
          Système de sécurité v2.0 • Panneau admin inclus
        </p>
      </div>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════
//                  PAGE DE CONNEXION ADMIN
// ═══════════════════════════════════════════════════════════

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connexion Admin</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .login-container {
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        .logo { text-align: center; font-size: 60px; margin-bottom: 20px; }
        h1 { text-align: center; color: #333; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; font-size: 14px; }
        .form-group { margin-bottom: 20px; }
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }
        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .error {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 4px solid #c33;
        }
        .back-link {
          text-align: center;
          margin-top: 20px;
        }
        .back-link a {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <div class="logo">🔐</div>
        <h1>Connexion Admin</h1>
        <p class="subtitle">Gérez les accès de sécurité</p>
        
        ${req.query.error ? '<div class="error">⚠️ Identifiants incorrects</div>' : ''}
        
        <form method="POST" action="/admin/login">
          <div class="form-group">
            <label for="username">👤 Nom d'utilisateur</label>
            <input type="text" id="username" name="username" required autofocus>
          </div>
          
          <div class="form-group">
            <label for="password">🔑 Mot de passe</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit" class="btn">Se connecter</button>
        </form>
        
        <div class="back-link">
          <a href="/">← Retour à l'accueil</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Traitement de la connexion
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.isAdmin = true;
    req.session.username = username;
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/login?error=1');
  }
});

// Déconnexion
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ═══════════════════════════════════════════════════════════
//                  DASHBOARD ADMIN
// ═══════════════════════════════════════════════════════════

app.get('/admin/dashboard', requireAuth, (req, res) => {
  const totalUsers = usersData.users.length;
  const totalAccess = accessLogs.length;
  const recentAccess = accessLogs.slice(-10).reverse();
  const authorizedAccess = accessLogs.filter(log => log.authorized).length;
  const deniedAccess = accessLogs.filter(log => !log.authorized).length;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard Admin</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 { font-size: 24px; display: flex; align-items: center; gap: 10px; }
        .user-info { font-size: 14px; opacity: 0.9; }
        .logout-btn {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
          padding: 8px 20px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        .logout-btn:hover { background: white; color: #667eea; }
        .container { max-width: 1400px; margin: 30px auto; padding: 0 30px; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .stat-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
        }
        .stat-label {
          color: #666;
          font-size: 14px;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        .btn-secondary:hover { background: #667eea; color: white; }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;
          overflow: hidden;
        }
        .card-header {
          padding: 20px 25px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-header h2 { font-size: 18px; color: #333; }
        .card-body { padding: 25px; }
        .table {
          width: 100%;
          border-collapse: collapse;
        }
        .table th {
          background: #f9f9f9;
          padding: 12px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #666;
        }
        .table td {
          padding: 15px 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        .table tr:hover { background: #f9f9f9; }
        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-success { background: #e8f5e9; color: #2e7d32; }
        .badge-danger { background: #ffebee; color: #c62828; }
        .action-icons {
          display: flex;
          gap: 10px;
        }
        .action-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          background: none;
        }
        .action-icon.edit {
          background: #e3f2fd;
          color: #1976d2;
        }
        .action-icon.delete {
          background: #ffebee;
          color: #c62828;
        }
        .action-icon:hover { transform: scale(1.1); }
        .log-item {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 13px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .log-item:last-child { border-bottom: none; }
        .log-item.success { border-left: 3px solid #4caf50; background: #f1f8f4; }
        .log-item.denied { border-left: 3px solid #f44336; background: #fef1f0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <div>
            <h1>🔐 Panneau Admin</h1>
            <div class="user-info">Connecté en tant que ${req.session.username}</div>
          </div>
          <a href="/admin/logout" class="logout-btn">Se déconnecter</a>
        </div>
      </div>
      
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-number">${totalUsers}</div>
            <div class="stat-label">Utilisateurs autorisés</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-number">${totalAccess}</div>
            <div class="stat-label">Accès total</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-number">${authorizedAccess}</div>
            <div class="stat-label">Accès autorisés</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div class="stat-number">${deniedAccess}</div>
            <div class="stat-label">Accès refusés</div>
          </div>
        </div>
        
        <div class="action-buttons">
          <a href="/admin/users" class="btn btn-primary">👥 Gérer les utilisateurs</a>
          <a href="/admin/logs" class="btn btn-secondary">📋 Voir tous les logs</a>
          <a href="/admin/settings" class="btn btn-secondary">⚙️ Paramètres</a>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2>👥 Utilisateurs autorisés</h2>
            <a href="/admin/users/add" class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">➕ Ajouter</a>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Roblox ID</th>
                  <th>Discord</th>
                  <th>Grade</th>
                  <th>Ajouté le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${usersData.users.map(user => `
                  <tr>
                    <td><strong>${user.firstName} ${user.lastName}</strong></td>
                    <td>${user.robloxUserId}</td>
                    <td>${user.discord || '-'}</td>
                    <td><span class="badge badge-success">${user.rank || 'Membre'}</span></td>
                    <td>${new Date(user.addedAt).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div class="action-icons">
                        <a href="/admin/users/edit/${user.id}" class="action-icon edit">✏️</a>
                        <button onclick="deleteUser(${user.id})" class="action-icon delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2>📊 Activité récente</h2>
          </div>
          <div class="card-body" style="padding: 0;">
            ${recentAccess.length === 0 ? 
              '<p style="padding: 20px; text-align: center; color: #999;">Aucune activité récente</p>' :
              recentAccess.map(log => `
                <div class="log-item ${log.authorized ? 'success' : 'denied'}">
                  <span>${log.authorized ? '✅' : '❌'} ${log.username} (ID: ${log.userId})</span>
                  <span style="color: #999; font-size: 12px;">${new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
      
      <script>
        function deleteUser(id) {
          if (confirm('Supprimer cet utilisateur ?')) {
            fetch('/admin/api/users/' + id, { method: 'DELETE' })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  location.reload();
                } else {
                  alert('Erreur: ' + data.error);
                }
              });
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════
//                  GESTION UTILISATEURS
// ═══════════════════════════════════════════════════════════

// Liste des utilisateurs
app.get('/admin/users', requireAuth, (req, res) => {
  res.redirect('/admin/dashboard');
});

// Ajouter un utilisateur (formulaire)
app.get('/admin/users/add', requireAuth, (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ajouter un utilisateur</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
        }
        .header-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .back-btn { color: white; text-decoration: none; font-size: 24px; }
        .container { max-width: 800px; margin: 30px auto; padding: 0 30px; }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 30px;
        }
        h1 { color: #333; margin-bottom: 30px; }
        .form-group { margin-bottom: 25px; }
        label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }
        .required { color: #e53935; }
        input[type="text"],
        input[type="number"] {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .help-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }
        .btn {
          padding: 12px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          text-decoration: none;
          display: inline-block;
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-secondary {
          background: #e0e0e0;
          color: #333;
        }
        .btn-secondary:hover { background: #d0d0d0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <a href="/admin/dashboard" class="back-btn">←</a>
          <h2>Ajouter un utilisateur</h2>
        </div>
      </div>
      
      <div class="container">
        <div class="card">
          <form method="POST" action="/admin/users/add">
            <div class="form-group">
              <label for="firstName">Prénom <span class="required">*</span></label>
              <input type="text" id="firstName" name="firstName" required>
            </div>
            
            <div class="form-group">
              <label for="lastName">Nom <span class="required">*</span></label>
              <input type="text" id="lastName" name="lastName" required>
            </div>
            
            <div class="form-group">
              <label for="robloxUserId">Roblox User ID <span class="required">*</span></label>
              <input type="number" id="robloxUserId" name="robloxUserId" required>
              <div class="help-text">Va sur le profil Roblox → Regarde l'URL</div>
            </div>
            
            <div class="form-group">
              <label for="discord">Pseudo Discord</label>
              <input type="text" id="discord" name="discord" placeholder="Username#1234">
            </div>
            
            <div class="form-group">
              <label for="rank">Grade/Rang</label>
              <input type="text" id="rank" name="rank" placeholder="Agent, Directeur, Garde...">
            </div>
            
            <div class="form-group">
              <label for="photoUrl">URL de la photo (optionnel)</label>
              <input type="text" id="photoUrl" name="photoUrl" placeholder="https://i.imgur.com/exemple.png">
              <div class="help-text">Utilise Imgur ou un autre hébergeur d'images</div>
            </div>
            
            <div class="button-group">
              <button type="submit" class="btn btn-primary">✓ Ajouter l'utilisateur</button>
              <a href="/admin/dashboard" class="btn btn-secondary">Annuler</a>
            </div>
          </form>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ajouter un utilisateur (traitement)
app.post('/admin/users/add', requireAuth, (req, res) => {
  const { firstName, lastName, robloxUserId, discord, rank, photoUrl } = req.body;
  
  const newUser = {
    id: usersData.users.length + 1,
    robloxUserId: parseInt(robloxUserId),
    firstName,
    lastName,
    discord: discord || '',
    rank: rank || 'Membre',
    photoUrl: photoUrl || '',
    addedBy: req.session.username,
    addedAt: new Date().toISOString()
  };
  
  usersData.users.push(newUser);
  res.redirect('/admin/dashboard');
});

// Supprimer un utilisateur (API)
app.delete('/admin/api/users/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const index = usersData.users.findIndex(u => u.id === id);
  
  if (index !== -1) {
    usersData.users.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
  }
});

// ═══════════════════════════════════════════════════════════
//                  LOGS
// ═══════════════════════════════════════════════════════════

app.get('/admin/logs', requireAuth, (req, res) => {
  const allLogs = accessLogs.slice().reverse();
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logs d'accès</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 30px;
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .back-btn { color: white; text-decoration: none; font-size: 24px; }
        .container { max-width: 1200px; margin: 30px auto; padding: 0 30px; }
        .card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        .card-header {
          padding: 20px 25px;
          border-bottom: 1px solid #e0e0e0;
        }
        .card-header h2 { font-size: 18px; color: #333; }
        .log-item {
          padding: 15px 25px;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .log-item:last-child { border-bottom: none; }
        .log-item.success { border-left: 4px solid #4caf50; background: #f1f8f4; }
        .log-item.denied { border-left: 4px solid #f44336; background: #fef1f0; }
        .log-info { flex: 1; }
        .log-user { font-weight: 600; color: #333; }
        .log-id { color: #666; font-size: 13px; margin-left: 10px; }
        .log-time { color: #999; font-size: 13px; }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }
        .empty-icon { font-size: 60px; margin-bottom: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <a href="/admin/dashboard" class="back-btn">←</a>
          <h2>Logs d'accès</h2>
        </div>
      </div>
      
      <div class="container">
        <div class="card">
          <div class="card-header">
            <h2>📋 Tous les accès (${allLogs.length} total)</h2>
          </div>
          ${allLogs.length === 0 ?
            '<div class="empty-state"><div class="empty-icon">📭</div><p>Aucun log d\'accès</p></div>' :
            allLogs.map(log => `
              <div class="log-item ${log.authorized ? 'success' : 'denied'}">
                <div class="log-info">
                  <span class="log-user">${log.authorized ? '✅' : '❌'} ${log.username}</span>
                  <span class="log-id">(ID: ${log.userId})</span>
                </div>
                <div class="log-time">${new Date(log.timestamp).toLocaleString('fr-FR')}</div>
              </div>
            `).join('')
          }
        </div>
      </div>
    </body>
    </html>
  `);
});

// ═══════════════════════════════════════════════════════════
//                  API ROBLOX
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
  
  // Log l'accès
  const logEntry = {
    userId,
    username,
    authorized: user !== null,
    timestamp: new Date().toISOString()
  };
  accessLogs.push(logEntry);
  
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
    totalUsers: usersData.users.length,
    totalAccess: accessLogs.length
  });
});

// ═══════════════════════════════════════════════════════════
//                  DÉMARRAGE SERVEUR
// ═══════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════');
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log('✅ API + Panneau Admin prêts !');
  console.log(`👥 ${usersData.users.length} utilisateur(s) autorisé(s)`);
  console.log('═══════════════════════════════════════');
  console.log('🔑 Identifiants admin par défaut:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('⚠️  CHANGE LE MOT DE PASSE !');
  console.log('═══════════════════════════════════════');
});
