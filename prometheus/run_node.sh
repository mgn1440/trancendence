#!/bin/sh

# wait-for-file 스크립트를 사용하여 인증서 파일이 존재할 때까지 대기
/usr/local/bin/wait-for-file.sh /etc/ssl/certs/node-exporter-selfsigned.crt 60

# 인증서 파일이 존재하면 Alertmanager 실행
exec "/usr/local/bin/node_exporter", "--web.listen-address=:9100", "--web.config=opt/node-exporter/web.yml"
