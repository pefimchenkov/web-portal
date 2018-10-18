module.exports = {
  port: process.env.PORT || 3000,
  db: {
    database: 'tsddb',
    user: 'root',
    password: '000TSDservice',
    host: '192.168.4.1',
    insecureAuth: true
  }
}
