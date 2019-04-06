# Taller de Programación II

[![Build Status](https://travis-ci.org/taller-2-slk-2019/Server.svg?branch=master)](https://travis-ci.org/taller-2-slk-2019/Server)
[![Coverage Status](https://coveralls.io/repos/github/taller-2-slk-2019/Server/badge.svg)](https://coveralls.io/github/taller-2-slk-2019/Server)

## Server

### Heroku

https://slack-taller2.herokuapp.com

### Documentación

https://taller-2-slk-2019.github.io

### Travis

https://travis-ci.org/taller-2-slk-2019/Server

### Coveralls

https://coveralls.io/github/taller-2-slk-2019/Server

### Instalación

- Instalar Node.js

- Instalar PotgreSQL

- Ejecutar npm install para actualizar librerias

- Crear una base de datos slack_server  (npx sequelize db:create)

- Correr las migraciones  (npx sequelize db:migrate)

### Ejecución

- node src/app.js

- El servidor se levanta en localhost:3000

### Testing

- npm test

- https://mochajs.org/

- https://www.chaijs.com/

### Base de datos

- http://docs.sequelizejs.com/

- Migraciones: npx sequelize db:migrate

- Crear base local: npx sequelize db:create

- Modelos: npx sequelize model:generate --name User --attributes firstName:string,lastName:string,email:string

### Otros

- Api REST: https://juanda.gitbooks.io/webapps/content/api/arquitectura-api-rest.html

- Postman: Programa para probar las apis, especialmente las que no son GET

