def test_register_user(client):
    """Test user registration with valid parameters."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_user@example.com",
            "password": "securepassword",
            "first_name": "New",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new_user@example.com"
    assert data["first_name"] == "New"
    assert data["role"] == "customer"

def test_register_duplicate_email(client, test_user):
    """Test registration blocks duplicate emails."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test_customer@example.com",
            "password": "newpassword123",
            "first_name": "Duplicate",
            "last_name": "User"
        }
    )
    assert response.status_code == 422
    assert response.json()["error_code"] == "VALIDATION_FAILED"

def test_login_success(client, test_user):
    """Test user login with valid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test_customer@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_customer@example.com"

def test_login_invalid_password(client, test_user):
    """Test login rejects invalid passwords."""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test_customer@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["error_code"] == "AUTHENTICATION_FAILED"

def test_get_me_profile(client, auth_headers):
    """Test accessing protected profile endpoint with JWT header."""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test_customer@example.com"
