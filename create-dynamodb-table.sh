aws dynamodb create-table \
    --table-name oauth-sessions \
    --attribute-definitions \
        AttributeName=modelId,AttributeType=S \
        AttributeName=uid,AttributeType=S \
        AttributeName=grantId,AttributeType=S \
        AttributeName=userCode,AttributeType=S \
    --key-schema \
        AttributeName=modelId,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"uidIndex\",
                \"KeySchema\": [
                    {\"AttributeName\":\"uid\",\"KeyType\":\"HASH\"}
                ],
                \"Projection\": {
                    \"ProjectionType\":\"ALL\"
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 5,
                    \"WriteCapacityUnits\": 5
                }
            },
            {
                \"IndexName\": \"grantIdIndex\",
                \"KeySchema\": [
                    {\"AttributeName\":\"grantId\",\"KeyType\":\"HASH\"}
                ],
                \"Projection\": {
                    \"ProjectionType\":\"ALL\"
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 5,
                    \"WriteCapacityUnits\": 5
                }
            },
            {
                \"IndexName\": \"userCodeIndex\",
                \"KeySchema\": [
                    {\"AttributeName\":\"userCode\",\"KeyType\":\"HASH\"}
                ],
                \"Projection\": {
                    \"ProjectionType\":\"ALL\"
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 5,
                    \"WriteCapacityUnits\": 5
                }
            }
        ]" \
        --endpoint-url http://localhost:8000

