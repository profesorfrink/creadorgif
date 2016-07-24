Estos son los pasos para tener funcionando el sitio en una vps de digitalocean (aplicable a otras vps).

**Prerrequisitos**

 1. VPS con ubuntu 16.04
 2. Acceso root a la misma

Para los que quieran probar, registrándose desde este [link](https://m.do.co/c/3773ab4463c8)  reciben U$S 10 de regalo, suficiente para mantener un droplet de 512MB de RAM durante 2 meses.

Para quienes no sepan generar claves ssh, aquí tienen tutoriales para [mac/linux](https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets) o [windows](https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-putty-on-digitalocean-droplets-windows-users) .
1- Accedemos a nuestra vps desde una consola en nuestro sistema operativo con el comando:

    ssh root@ip.nuestro.vps
2- Actualizamos apt-get

    apt-get update
3- Instalamos imagemagick, ffmpeg (junto con sus prerrequisitos) y redis

    apt-get build-dep imagemagick 
    apt-get install imagemagick
    apt-get build-dep ffmpeg 
    apt-get install ffmpeg
    apt-get install -y  redis-server npm
En caso de solicitarnos alguna confirmación, seguimos con la opción por defecto

4- Instalamos GraphicsMagick y unzip

    add-apt-repository ppa:dhor/myway -y
    apt-get update
    apt-get install -y unzip graphicsmagick
5- Instalamos gifsicle y youtube-dl

    curl -OJL https://github.com/pornel/giflossy/releases/download/lossy%2F1.82.1/gifsicle-1.82.1-lossy.zip
    unzip gifsicle-1.82.1-lossy.zip -d gifsicle
    mv gifsicle/linux/gifsicle-debian6 /usr/local/bin/gifsicle
    sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
    sudo chmod a+rx /usr/local/bin/youtube-dl
    
6- Instalamos los programas necesarios para nodejs

    npm install -g n gifify pm2

7- Usamos n para instalar la última versión estable de Node.js

    n stable
8- Como medida de seguridad, no es conveniente ejecutar los procesos como usuario root, por lo cual crearemos un nuevo usuario que será el "dueño" del programa

    useradd -mrU web
    mkdir /var/www
    chown -R web /var/www
    chgrp -R web /var/www
    cd /var/www
9- Comenzamos con nuestro nuevo usuario, bajamos el programa, instalamos las depedencias y ejecutamos con pm2 para que en caso de error se reinicie el programa

    su web
    git clone https://github.com/profesorfrink/creadorgif.git
    cd creadorgif
    npm install
    NODE_ENV=production
    pm2 start app.js
    pm2 start jobs/index.js
    
10- Con esto ya deberíamos ver la web desde ip.nuestro.vps:3000, sin embargo recomendaría lo siguiente


RECOMENDACIONES
---------------

1- Instalar nginx para servir archivos estáticos. Si vamos a usar nuestro programa desde la web, Nginx es un servidor super eficiente para este tipo de tareas
Si estamos como usuario web todavía, deberemos ejecutar el comando `exit`

    exit
    apt-get install -y nginx
   
configuramos el archivo default para que las peticiones que llegan a nuestro servidor nginx, en caso de no ser archivos estáticos, se transladen a nuestro programa. Como es dificultoso borrar el contenido desde el editor nano, directamente borramos el archivo y lo volvemos a crear.

    cd /etc/nginx/sites-available/
    rm default
    nano default
     
    
Este es el contenido que hay que pegar en el archivo default

    server {
    listen 80;

    server_name localhost;

    location / {
        client_max_body_size 10M;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /public {
      root /var/www/creadorgif;
      access_log off;
      expires 24h;
    }}

Finalmente reiniciamos el servicio de nginx para que tome los cambios, una vez hecho esto ya deberíamos poder acceder a nuestra web desde ip.nuestro.vps

    sudo service nginx restart
2- Crear una partición de swap.
Generalmente, los VPS no vienen con una partición SWAP configurada, por lo que es probable que nos quedemos sin memoria disponible ( estamos trabajando con archivos multimedia de gran tamaño). Se recomienda encarecidamente crear una nueva siguiendo estos pasos:

    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
Editamos el archivo /etc/fstab    

    sudo nano /etc/fstab
    
y al final del mismo, agregamos la siguiente linea

    /swapfile   none    swap    sw    0   0

Útlimos ajustes

    sudo sysctl vm.swappiness=10
    sudo sysctl  vm.vfs_cache_pressure=50
Editamos el archivo /etc/sysctl.conf para que estos cambios no se pierdan al reiniciar el servidor

    nano  /etc/sysctl.conf
    vm.swappiness=10
    vm.vfs_cache_pressure=50

