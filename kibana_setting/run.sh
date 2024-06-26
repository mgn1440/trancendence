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
	



{
	"id":"a9e22440-3368-11ef-92d4-0f3d1e429193",
	"type":"dashboard","namespaces":["default"],
	"updated_at":"2024-06-26T03:20:07.376Z",
	"version":"WzExMywxXQ==",
	"attributes":{
		"title":"django-dashboard",
		"hits":0,"description":"",
		"panelsJSON":
		"[
			{
				\"version\":\"7.17.22\",
				\"type\":\"lens\",
				\"gridData\":
				{
					\"x\":0,\"y\":0,\"w\":24,\"h\":15,\"i\":\"1649b02a-24c8-46f6-8451-c5a4073ab501\"
				},
				\"panelIndex\":\"1649b02a-24c8-46f6-8451-c5a4073ab501\",
				\"embeddableConfig\":{
					\"attributes\":{
						\"title\":\"\",
						\"visualizationType\":\"lnsPie\",
						\"type\":\"lens\",
						\"references\":[
							{
								\"type\":\"index-pattern\",
								\"id\":\"a9456f10-3368-11ef-92d4-0f3d1e429193\",
								\"name\":\"indexpattern-datasource-current-indexpattern\"
							},
							{
								\"type\":\"index-pattern\",
								\"id\":\"a9456f10-3368-11ef-92d4-0f3d1e429193\",
								\"name\":\"indexpattern-datasource-layer-945d6743-b40f-40ae-b6e3-640ea27b6e62\"
							}
						],
						\"state\":{
							\"visualization\":{
								\"shape\":\"donut\",
								\"layers\":[
									{
										\"layerId\":\"945d6743-b40f-40ae-b6e3-640ea27b6e62\",
										\"groups\":[\"7306e107-4d49-40d9-841f-bd8cd43a73cb\"],
										\"metric\":\"ef7c013d-f067-4f41-ab50-c47ee297328c\",
										\"numberDisplay\":\"percent\",
										\"categoryDisplay\":\"default\",
										\"legendDisplay\":\"default\",
										\"nestedLegend\":false,
										\"layerType\":\"data\"}]},\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filters\":[],\"datasourceStates\":{\"indexpattern\":{\"layers\":{\"945d6743-b40f-40ae-b6e3-640ea27b6e62\":{\"columns\":{\"7306e107-4d49-40d9-841f-bd8cd43a73cb\":{\"label\":\"웹소켓 라우팅 횟수\",\"dataType\":\"string\",\"operationType\":\"terms\",\"scale\":\"ordinal\",\"sourceField\":\"path.keyword\",\"isBucketed\":true,\"params\":{\"size\":5,\"orderBy\":{\"type\":\"column\",\"columnId\":\"ef7c013d-f067-4f41-ab50-c47ee297328c\"},\"orderDirection\":\"desc\",\"otherBucket\":true,\"missingBucket\":false},\"customLabel\":true},\"ef7c013d-f067-4f41-ab50-c47ee297328c\":{\"label\":\"Count of records\",\"dataType\":\"number\",\"operationType\":\"count\",\"isBucketed\":false,\"scale\":\"ratio\",\"sourceField\":\"Records\"}},\"columnOrder\":[\"7306e107-4d49-40d9-841f-bd8cd43a73cb\",\"ef7c013d-f067-4f41-ab50-c47ee297328c\"],\"incompleteColumns\":{}}}}}}},\"enhancements\":{},\"hidePanelTitles\":false},\"title\":\"websocket_log\"}]","optionsJSON":"{\"useMargins\":true,\"syncColors\":false,\"hidePanelTitles\":false}","version":1,"timeRestore":false,"kibanaSavedObjectMeta":{"searchSourceJSON":"{\"query\":{\"query\":\"\",\"language\":\"kuery\"},\"filter\":[]}"}},"references":[{"type":"index-pattern","id":"a9456f10-3368-11ef-92d4-0f3d1e429193","name":"1649b02a-24c8-46f6-8451-c5a4073ab501:indexpattern-datasource-current-indexpattern"},{"type":"index-pattern","id":"a9456f10-3368-11ef-92d4-0f3d1e429193","name":"1649b02a-24c8-46f6-8451-c5a4073ab501:indexpattern-datasource-layer-945d6743-b40f-40ae-b6e3-640ea27b6e62"}],"migrationVersion":{"dashboard":"7.17.3"},"coreMigrationVersion":"7.17.22"}