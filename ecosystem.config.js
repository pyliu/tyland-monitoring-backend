module.exports = {
  apps: [{
    name: 'tyland-monitoring-backend',
    exec_mode: 'cluster',
    instances: 1,
    script: './server.js',
    out_file: './logs/backend_out.log',
    error_file: './logs/backend_err.log',
    cron_restart: '50 7 * * *',
    time: true,
    watch: true,
    ignore_watch: ['[/\\]./', 'node_modules', '*.bat', '.git', '.vscode', 'rest-tests', 'assets', 'logs'],
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production'
    },
    wait_ready: true,
    restart_delay: 10000
  }]
}
