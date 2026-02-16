FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache ffmpeg ttf-dejavu
COPY package*.json ./
RUN npm install --production
COPY src ./src

RUN mkdir -p uploads logs
EXPOSE 5000
CMD ["npm", "run", "start"]

