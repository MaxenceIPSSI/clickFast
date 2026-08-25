FROM nginx:1.30.4-alpine-slim

RUN chown -R nginx:nginx /var/cache/nginx \
 && sed -i 's|^pid .*|pid /tmp/nginx.pid;|' /etc/nginx/nginx.conf \
 && sed -i 's|listen  *80;|listen 8080;|' /etc/nginx/conf.d/default.conf \
 && rm -rf /usr/share/nginx/html/*

COPY index.html style.css script.js /usr/share/nginx/html/

USER nginx

EXPOSE 8080
