module.exports = {
  apps: [
    {
      name: 'kirana-be-prod',
      script: './dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      log_file: '/var/log/pm2/prod/combined.log',
      out_file: '/var/log/pm2/prod/out.log',
      error_file: '/var/log/pm2/prod/error.log',
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
