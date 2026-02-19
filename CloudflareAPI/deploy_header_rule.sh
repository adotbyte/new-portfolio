#!/bin/bash

# Your Cloudflare Zone ID and API Token
ZONE_ID="b186ea02f02e0f7f21ef68b1d44fe8d8"
API_TOKEN="g1UFDdYqD_5Tjh7SCLhUUjPeqiDQ0II011ATqgd2"

# API endpoint
URL="https://api.cloudflare.com/client/v4/zones/$ZONE_ID/transform_rules"

# Send the JSON from the file
curl -X POST "$URL" \
     -H "Authorization: Bearer $API_TOKEN" \
     -H "Content-Type: application/json" \
     -d @header_rule.json
