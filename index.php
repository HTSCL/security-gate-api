<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Système de Sécurité</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
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
            max-width: 600px;
        }
        .logo {
            font-size: 80px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 15px;
        }
        p {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.6;
        }
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
        .info-box h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        code {
            background: #e0e0e0;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🔐</div>
        <h1>Système de Sécurité Roblox</h1>
        <p>API de vérification d'accès pour votre jeu Roblox</p>
        
        <div class="status">✓ En ligne</div>
        
        <div class="info-box">
            <h3>📡 Endpoint API</h3>
            <p><code><?php echo 'https://' . $_SERVER['HTTP_HOST'] . '/api/checkuser.php'; ?></code></p>
        </div>
        
        <div class="info-box">
            <h3>🔧 Configuration Roblox</h3>
            <p>Dans votre script SecuritySystem, utilisez cette URL :</p>
            <code>local API_URL = "<?php echo 'https://' . $_SERVER['HTTP_HOST'] . '/api/checkuser.php'; ?>"</code>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #999;">
            Propulsé par Replit • Système de sécurité v1.0
        </p>
    </div>
</body>
</html>
