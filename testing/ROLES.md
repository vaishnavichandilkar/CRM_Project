# Roles & Permissions Testing

## List All Roles
**GET** `/roles`
```bash
curl -X GET http://localhost:5000/roles \
-H "Authorization: Bearer YOUR_TOKEN"
```

## List All Permissions
**GET** `/roles/permissions`
```bash
curl -X GET http://localhost:5000/roles/permissions \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Update Permissions (By ID)
**PATCH** `/roles/{id}/permissions`
```bash
curl -X PATCH http://localhost:5000/roles/2/permissions \
-H "Authorization: Bearer ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "permissionIds": [1, 3, 5]
}'
```

## Update Permissions (By Name)
**PATCH** `/roles/{id}/permissions`
```bash
curl -X PATCH http://localhost:5000/roles/3/permissions \
-H "Authorization: Bearer ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "permissionNames": ["leads", "sales", "reports_basic"]
}'
```
