// PM2 tanımı. İlk kez: pm2 start ecosystem.config.cjs && pm2 save
// Sonraki güncellemeler: ./updateproject.sh
module.exports = {
  apps: [
    {
      name: "motovoix",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      // Yalnızca localhost; dışarıya Nginx açılır. .env'i Next kendisi okur.
      args: "start --hostname 127.0.0.1 --port 3000",
    },
  ],
};
