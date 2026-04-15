module.exports = {
  apps: [
    {
      name: "preprod.kiranaapps.com",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/ubuntu/project/preprod-backend-monorepo/kirana-fe",
      kill_timeout: 20000,
      instances: "1",
      exec_mode: "cluster",
      env_production: {
        PORT: 4000,
        NODE_ENV: "production",
      },
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: "services.kiranaapps.com",
      kill_timeout: 20000,
      wait_ready: true,
      listen_timeout: 10000,
      script: "dist/src/main.js",
      cwd: "/home/ubuntu/project/backend-monorepo/kwiktwik-kirana-be",
      instances: "2",
      exec_mode: "cluster",
      env_production: {
        PORT: 4010,
        NODE_ENV: "production",
      },
    },
    {
      name: "api.kiranaapps.com",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/ubuntu/project/backend-monorepo/kirana-fe",
      kill_timeout: 20000,
      instances: "1",
      exec_mode: "cluster",
      env_production: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: "segment-trial-ended-cron",
      cwd: "/home/ubuntu/project/backend-monorepo/kirana-fe",
      script: "scripts/segment-trial-ended-cron.js",
      cron_restart: "0 */6 * * *", // Run every 6 hours (at minute 0)
      autorestart: false,
      watch: false,
      env_production: {
        PORT: 3000,
        BASE_URL: "https://api.kiranaapps.com",
        CRON_SECRET: "Xv8UHlz740SH",
      },
    },
  ],
};
