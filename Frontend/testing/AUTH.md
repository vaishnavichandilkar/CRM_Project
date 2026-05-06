# Auth Module Testing

## Sign Up
**POST** `/auth/signup`
```bash
curl -X POST http://localhost:5000/auth/signup \
-H "Content-Type: application/json" \
-d '{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}'
```

## Sign In
**POST** `/auth/signin`
```bash
curl -X POST http://localhost:5000/auth/signin \
-H "Content-Type: application/json" \
-d '{
  "email": "john@example.com",
  "password": "password123"
}'
```

## Logout
**POST** `/auth/logout`
```bash
curl -X POST http://localhost:5000/auth/logout \
-H "Authorization: Bearer YOUR_TOKEN"
```
