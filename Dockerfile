FROM node:22

WORKDIR /myapp

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Copiar el resto
COPY . .

# Instalar dependencias (incluyendo devDependencies)
RUN npm install

EXPOSE 4300

CMD ["npm", "run", "dev"]