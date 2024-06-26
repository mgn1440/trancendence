#!/bin/sh

while true; do
  # curl 명령어 실행
	if [ -f index_pattern ]; then
		echo "인덱스패턴이 이미 생성되어 있습니다."
		break
	fi
	
  	response=$(
		curl -f --cacert /config/ca/ca.crt \
		-X POST https://kibana:5601/api/saved_objects/index-pattern \
		-u elastic:abc123 -H 'kbn-xsrf: true' -H 'Content-Type: application/json'\
		-d '{
			"attributes": {
				"title": "django*", 
				"timeFieldName": "@timestamp",
				"id": "django-index"
				}
			}'
		)
	if [ $? -eq 0 ]; then
		echo "인덱스패턴 생성"
		touch index_pattern
		break
	else
		echo "인덱스패턴 생성시도.."
		# 실패했을 경우 잠시 대기 (예: 5초 대기)
		sleep 2
	fi
done

while true; do
  # curl 명령어 실행
	if [ -f dashboard ]; then
		echo "인덱스패턴이 이미 생성되어 있습니다."
		break
	fi
  	response=$(curl -f --cacert /config/ca/ca.crt \
	  -X POST https://kibana:5601/api/saved_objects/dashboard \
	  -u elastic:abc123 -H 'kbn-xsrf: true' -H 'Content-Type: application/json' \
	  -d '{"attributes": {"title": "django-dashboard"}}')
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
	

