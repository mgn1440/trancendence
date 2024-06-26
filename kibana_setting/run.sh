#!/bin/sh

while true; do
  # curl 명령어 실행
	if [ -f dashboard ]; then
		echo "인덱스패턴이 이미 생성되어 있습니다."
		break
	fi
  	response=$(curl -f --cacert /config/ca/ca.crt \
	  -X POST https://kibana:5601/api/saved_objects/_import \
	  -u elastic:abc123 -H 'kbn-xsrf: true' --form file=@/run/export.ndjson)
	if [ $? -eq 0 ]; then
		echo "대시보드 생성"
		touch dashboard
		break
	else
		echo "대시보드 생성시도.."
		# 실패했을 경우 잠시 대기 (예: 5초 대기)
		sleep 2
	fi
done

if [ -f lifecycle]; then
	curl --cacert /config/ca/ca.crt -u elastic:abc123 -X PUT "https://elasticsearch:9200/_ilm/policy/30-days-default" -H 'Content-Type: application/json' -d'{ "policy": {"phases": {"hot": {"actions": {"rollover": {"max_age": "30d","max_size": "50gb"}}},"delete": {"min_age": "30d", "actions": {"delete": {}}}}}}'
	curl --cacert /config/ca/ca.crt -u elastic:abc123 -X PUT "https://elasticsearch:9200/_index_template/django_template" -H 'Content-Type: application/json' -d'{"index_patterns": ["django*"],"template": {"settings": {"index.lifecycle.name": "30-days-default","index.lifecycle.rollover_alias": "django_alias"}}}'
	touch lifecycle
	echo "라이프사이클 설정까지 완료"
fi