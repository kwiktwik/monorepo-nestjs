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
      instances: 1,
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
      instances: "2",
      exec_mode: "cluster",
      env_production: {
        PORT: 3000,
        NODE_ENV: "production",
      },
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: "check-subscriptions-cron",
      cwd: "/home/ubuntu/project/backend-monorepo/kirana-fe",
      script: "scripts/check-subscriptions-cron.js",
      cron_restart: "*/15 * * * *", // Run every 15 minutes
      autorestart: false, // Don't auto-restart, only run on cron schedule
      watch: false,
      env_production: {
        PORT: 3000, // Use the first app's port
        BASE_URL: "https://api.kiranaapps.com", // Production domain
        CRON_SECRET: "Xv8UHlz740SH", // Pass through from system env
      },
    },
    {
      name: "discount-notifications-cron",
      cwd: "/home/ubuntu/project/backend-monorepo/kirana-fe",
      script: "scripts/discount-notifications-cron.js",
      cron_restart: "*/30 * * * *", // Run every 30 minutes
      autorestart: false, // Don't auto-restart, only run on cron schedule
      watch: false,
      env_production: {
        BASE_URL: "https://api.kiranaapps.com", // Production domain
        CRON_SECRET: "Xv8UHlz740SH", // Pass through from system env
      },
    },
  ],
};
