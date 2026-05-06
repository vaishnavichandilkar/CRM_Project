# Users Module Testing

## List All Users
**GET** `/users`
```bash
curl -X GET http://localhost:5000/users \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Get User by ID
**GET** `/users/{id}`
```bash
curl -X GET http://localhost:5000/users/1 \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Create User (Admin Only)
**POST** `/users`
```bash
curl -X POST http://localhost:5000/users \
-H "Authorization: Bearer ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "firstName": "Staff",
  "lastName": "Member",
  "email": "staff@example.com",
  "password": "password123",
  "roleId": 3
}'
```

## Update User (Admin Only)
**PATCH** `/users/{id}`
```bash
curl -X PATCH http://localhost:5000/users/2 \
-H "Authorization: Bearer ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "status": "INACTIVE"
}'
```

## Delete User (Admin Only)
**DELETE** `/users/{id}`
```bash
curl -X DELETE http://localhost:5000/users/2 \
-H "Authorization: Bearer ADMIN_TOKEN"
```
