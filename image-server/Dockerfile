FROM shito/alpine-nginx:edge

# Add PHP 7
RUN set -x \
    && apk upgrade -U \
    && apk --update \
    #   --repository=http://dl-4.alpinelinux.org/alpine/edge/testing \
    add \
    openssl \
    nano \
    ffmpeg \
    file \
    unzip \
    bash \
    curl \
    php7 \
    php7-pdo \
    php7-exif \
    php7-mcrypt \
    php7-curl \
    php7-gd \
    php7-json \
    php7-fpm \
    php7-openssl \
    php7-ctype \
    php7-opcache \
    php7-mbstring \
    php7-sodium \
    php7-xml \
    php7-ftp \
    php7-simplexml \
    php7-session \
    php7-fileinfo \
    php7-pcntl \
    git \
    && rm -rf /var/cache/apk/*

# s6 overlay
# all supported architectures look at "assets" on
# https://github.com/just-containers/s6-overlay/releases
RUN /bin/bash -c 'set -ex && \
    ARCH="$(apk --print-arch)" && \
    case "${ARCH##*-}" in \
    x86_64) S6_PLATFORM="amd64" ;; \
    armv7l) S6_PLATFORM="armhf" ;; \
    armv7) S6_PLATFORM="armhf" ;; \
    armv6) S6_PLATFORM="armhf" ;; \
    armhf) S6_PLATFORM="armhf" ;; \
    arm) S6_PLATFORM="arm" ;; \
    aarch64) S6_PLATFORM="aarch64" ;;\
    i386) S6_PLATFORM="x86" ;;\
    *) echo >&2 "unsupported architecture: ${ARCH}"; exit 1 ;; \
    esac; \
    curl -L -s https://github.com/just-containers/s6-overlay/releases/download/${S6_VERSION}/s6-overlay-${S6_PLATFORM}.tar.gz \
    | tar xvzf - -C / '

COPY /rootfs /

# Small fixes
RUN rm /usr/bin/php && \
    ln -s /etc/php7 /etc/php && \
    ln -s /usr/bin/php7 /usr/bin/php && \
    ln -s /usr/sbin/php-fpm7 /usr/bin/php-fpm && \
    ln -s /usr/lib/php7 /usr/lib/php && \
    rm -fr /var/cache/apk/* && \
    mkdir -p /var/log/php-fpm && \
    ln -s /dev/stderr /var/log/php-fpm/fpm-error.log

# Enable default sessions
RUN mkdir -p /var/lib/php7/sessions
RUN chown nginx:nginx /var/lib/php7/sessions

# ADD SOURCE
RUN mkdir -p /usr/share/nginx/html
RUN chown -Rf nginx:nginx /usr/share/nginx/html

WORKDIR /usr/share/nginx/html

RUN git clone https://github.com/gctools-outilsgc/Image-Resource-Server.git .
RUN git checkout master
RUN git pull
RUN mv inc/example.config.inc.php inc/config.inc.php \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chmod +x bin/ffmpeg

VOLUME /usr/share/nginx/html/data

RUN chmod +x bin/ffmpeg

RUN chown -Rf nginx:nginx /usr/share/nginx/html
RUN chmod -R 777 /usr/share/nginx/html/
RUN chmod 777 /etc/pictshare.sh

EXPOSE 80

ENTRYPOINT ["/etc/pictshare.sh"]
