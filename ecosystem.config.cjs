module.exports = {
  apps: [
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
        cwd: "/home/ubuntu/project/backend-monorepo/kwiktwik-kirana-fe",
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
      name: "preprod.kiranaapps.com",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/ubuntu/project/backend-monorepo/kwiktwik-kirana-fe",
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
  ],
};
