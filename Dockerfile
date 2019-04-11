FROM node:10

EXPOSE 3000

# Create app directory
WORKDIR /home/app

COPY . /home/app

RUN npm install

CMD [ "node", "./src/app.js" ]
