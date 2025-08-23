 Open Open Postman** → Create a new request

- **Method**: `POST`

- **URL**: http://127.0.0.1:8000/api/accounts/register/
  
  Headers** (optional for now, but good practice)
  
  Content-Type: application/json

- **Body (raw JSON)**  
  Example test request:
  
  {
   "username": "alice",
   "email": "[alice@example.com](mailto:alice@example.com)",
   "password": "password123"
  }

- Expected Response

    {
      "message": "User registered successfully. Please check your email for verification link."
    }
