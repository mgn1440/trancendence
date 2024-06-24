#!/bin/sh

# Generate a self-signed certificate for the server
mkdir -p /etc/ssl/certs

echo "[SAN]\nsubjectAltName=DNS:prometheus" > /tmp/san_config.cnf \
    && cat /etc/ssl/openssl.cnf /tmp/san_config.cnf > /tmp/openssl.cnf \
    && openssl req -x509 -newkey rsa:2048 -nodes \
       -keyout /etc/ssl/certs/prometheus-selfsigned.key \
       -out /etc/ssl/certs/prometheus-selfsigned.crt \
       -subj "/C=KR/ST=GEYOUNG-GI-DO/L=SEOUL/O=42SEOUL/OU=CARDET/CN=prometheus" \
       -reqexts SAN \
       -config /tmp/openssl.cnf \
       -extensions SAN

echo "[SAN]\nsubjectAltName=DNS:node-exporter" > /tmp/san_config.cnf \
    && cat /etc/ssl/openssl.cnf /tmp/san_config.cnf > /tmp/openssl.cnf \
    && openssl req -x509 -newkey rsa:2048 -nodes \
       -keyout /etc/ssl/certs/node-exporter-selfsigned.key \
       -out /etc/ssl/certs/node-exporter-selfsigned.crt \
       -subj "/C=KR/ST=GEYOUNG-GI-DO/L=SEOUL/O=42SEOUL/OU=CARDET/CN=node-exporter" \
       -reqexts SAN \
       -config /tmp/openssl.cnf \
       -extensions SAN

echo "[SAN]\nsubjectAltName=DNS:alertmanager" > /tmp/san_config.cnf \
    && cat /etc/ssl/openssl.cnf /tmp/san_config.cnf > /tmp/openssl.cnf \
    && openssl req -x509 -newkey rsa:2048 -nodes \
       -keyout /etc/ssl/certs/alertmanager-selfsigned.key \
       -out /etc/ssl/certs/alertmanager-selfsigned.crt \
       -subj "/C=KR/ST=GEYOUNG-GI-DO/L=SEOUL/O=42SEOUL/OU=CARDET/CN=alertmanager" \
       -reqexts SAN \
       -config /tmp/openssl.cnf \
       -extensions SAN

echo "Certificates generated successfully"
