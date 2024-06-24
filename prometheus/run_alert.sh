#!/bin/sh

# wait-for-file 스크립트를 사용하여 인증서 파일이 존재할 때까지 대기
/usr/local/bin/wait-for-file.sh /etc/ssl/certs/alertmanager-selfsigned.crt 60

# 인증서 파일이 존재하면 Alertmanager 실행
exec /usr/local/bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml --storage.path=/alertmanager --web.config.file=/opt/alertmanager/web.yml
