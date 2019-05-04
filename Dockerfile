FROM node:10

EXPOSE 3000

# Create app directory
WORKDIR /home/app

COPY . /home/app

RUN apt-get -q update && apt-get -qy install netcat

RUN npm install

CMD [ "node", "./src/app.js" ]
