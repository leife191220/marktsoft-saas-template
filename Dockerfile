FROM php:8.2-apache

# 1. Instalar dependencias del sistema, librerías de imagen, zip y Node.js
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    nodejs \
    npm

# 2. Configurar e instalar extensiones PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_pgsql pcntl gd zip

# 3. Habilitar mod_rewrite de Apache (crucial para las rutas)
RUN a2enmod rewrite

# 4. Apuntar DocumentRoot a la carpeta /public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Copiar el código fuente
WORKDIR /var/www/html
COPY . .

# 6. Instalar dependencias de PHP
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# 7. Compilar los assets de React/Inertia
RUN npm install && npm run build

# 8. Permisos para Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. Configurar puerto dinámico, limpiar caché e iniciar Apache
CMD sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf && \
    sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/000-default.conf && \
    php artisan optimize:clear && \
    apache2-foreground