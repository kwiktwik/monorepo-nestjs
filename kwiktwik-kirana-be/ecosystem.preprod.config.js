module.exports = {
  apps: [
    {
      name: 'kirana-be-preprod',
      script: './dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'preproduction',
        PORT: 3010,
      },
      log_file: '/var/log/pm2/preprod/combined.log',
      out_file: '/var/log/pm2/preprod/out.log',
      error_file: '/var/log/pm2/preprod/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      exp_backoff_restart_delay: 100,
    },
  ],
};
