module.exports = {
  apps: [
    {
      name: "dating-site-backend",
      script: "./backend/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        JWT_SECRET: "dating-site-secret-key-2024",
        ADMIN_EMAIL: "renataraev51@gmail.com",
        ADMIN_PASSWORD: "12345.Rem"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "300M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      merge_logs: true,
      autorestart: true,
      restart_delay: 5000
    }
  ]
}; 