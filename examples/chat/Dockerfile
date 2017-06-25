FROM mhart/alpine-node:7

COPY package.json package.json
RUN npm install --production

# Add your source files
COPY . .

EXPOSE 3001
CMD ["npm","start"]
