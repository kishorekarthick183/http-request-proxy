for i in {1..51}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/proxy \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "test-user",
      "url": "https://httpbin.org/get",
      "method": "GET"
    }'
done
