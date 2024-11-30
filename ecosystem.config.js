module.exports = {
  apps: [{
    name: 'image-metadata-tool',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
