module.exports = {
  development: {
    username: "postgres",
    password: "123456",
    database: "slack_server",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false
  },
  test: {
    username: process.env.TRAVIS ? 'root' : "postgres",
    password: process.env.TRAVIS ? null : "123456",
    database: "slack_server_test",
    host: "127.0.0.1",
    dialect: "postgres",
    logging: false
  },
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB,
    host: process.env.PROD_DB_HOST,
    port: "5432",
    dialect: "postgres",
    logging: false
  }
}
