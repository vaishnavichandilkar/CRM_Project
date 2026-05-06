# Products Module Testing

## List All Products
**GET** `/products`
```bash
curl -X GET http://localhost:5000/products \
-H "Authorization: Bearer YOUR_TOKEN"
```

## Create Product
**POST** `/products`
```bash
curl -X POST http://localhost:5000/products \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "New Smartphone",
  "sku": "PHN-2026",
  "category": "Electronics",
  "price": 699.99,
  "stock": 100,
  "description": "Latest model smartphone"
}'
```

## Update Product
**PATCH** `/products/{id}`
```bash
curl -X PATCH http://localhost:5000/products/1 \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "price": 649.99,
  "stock": 85
}'
```

## Delete Product
**DELETE** `/products/{id}`
```bash
curl -X DELETE http://localhost:5000/products/1 \
-H "Authorization: Bearer YOUR_TOKEN"
```
