FROM nginx:1.30.4-alpine

# L'image officielle demarre son master en root. Ajouter "USER nginx" tout seul
# ne suffit pas, le conteneur meurt au demarrage :
#   nginx: [emerg] mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
# Trois choses appartiennent a root et doivent bouger AVANT de changer d'utilisateur :
#   1. /var/cache/nginx, ou nginx cree ses repertoires temporaires au demarrage
#   2. le fichier pid, ecrit par defaut dans /run/ qui n'est pas accessible en ecriture
#   3. le port d'ecoute : 80 est un port privilegie, on passe au-dessus de 1024
RUN chown -R nginx:nginx /var/cache/nginx \
 && sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
 && sed -i 's|listen  *80;|listen 8080;|' /etc/nginx/conf.d/default.conf \
 && rm -rf /usr/share/nginx/html/*

COPY index.html style.css script.js /usr/share/nginx/html/
USER nginx
EXPOSE 8080
