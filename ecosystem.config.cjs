module.exports = {
  apps: [
    {
      name: 'seoul-bd-dental',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=bdbddc-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        // wrangler 4.106+ 는 Node 22 필요 — /usr/local/bin의 Node 22 우선 사용
        PATH: '/usr/local/bin:' + process.env.PATH
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
