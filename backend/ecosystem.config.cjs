module.exports = {
  apps: [{
    name: "taller-api-empresarial",
    script: "src/index.ts",
    node_args: "--import tsx",
    instances: "max", // Modo Cluster: usa todos los núcleos de la CPU
    exec_mode: "cluster",
    // Producción: Variables de entorno protegidas
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      MONGO_URI: "mongodb+srv://maestria:maestria@maestria-mongo.wrsshws.mongodb.net/?appName=maestria-mongo"
    },
    // Logs y Monitoreo del Servidor
    error_file: "/var/www/taller-api/logs/err.log",
    out_file: "/var/www/taller-api/logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true
  }],
  // Automatización del Despliegue desde tu PC local
  deploy: {
    production: {
      user: 'ubuntu',
      host: '32.195.240.6',
      ref: 'origin/main',
      repo: 'git@github.com:EnzoAliatis/taller-api-empresarial.git',
      path: '/var/www/taller-api',
      'post-deploy': 'cd backend && mkdir -p ../../logs && npm install --include=dev && pm2 reload ecosystem.config.cjs --env production && pm2 save && bash scripts/notificar-deploy.sh',
      ssh_options: "IdentityFile=~/.ssh/id_ed25519" // Ruta a tu llave .pem local
    }
  }
};
