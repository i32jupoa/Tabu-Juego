const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '.output/public');
const indexPath = path.join(publicDir, 'index.html');

// Crear un index.html básico que carga la aplicación
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Tabú — Juego de palabras prohibidas</title>
  <meta name="description" content="Juega al clásico Tabú con 2 a 5 equipos: cartas por temáticas, mazos personalizados, cronómetro y marcador automático.">
  <meta name="theme-color" content="#ff6b6b">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Tabú">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="icon" href="/favicon.ico">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #ffffff;
      min-height: 100vh;
    }
    #app {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(indexPath, html);
console.log('✓ Created index.html for Capacitor');
