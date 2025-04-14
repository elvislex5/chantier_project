FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:stable-alpine

# Copier la configuration Nginx personnalisée si nécessaire
COPY --from=build /app/dist /usr/share/nginx/html

# Configurer Nginx pour les SPA (Single Page Applications)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 