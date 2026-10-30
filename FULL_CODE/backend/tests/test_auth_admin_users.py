import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_admin_initial_login_and_password_hashing():
    """
    Test initial admin login using configured default credentials (ADMIN001 / Admin@123).
    Must return role 'admin' and must_change_password True.
    """
    res = client.post("/api/auth/login", json={
        "user_id": "ADMIN001",
        "password": "Admin@123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["user_id"] == "ADMIN001"
    assert data["role"] == "admin"
    assert data["must_change_password"] is True
    assert "token" in data

def test_admin_login_invalid_password_rejection():
    """
    Invalid credentials must be rejected with 401.
    """
    res = client.post("/api/auth/login", json={
        "user_id": "ADMIN001",
        "password": "WrongPassword!999"
    })
    assert res.status_code == 401

def test_admin_first_login_password_change():
    """
    Admin can change initial password to a new secure password.
    """
    # Change password
    res = client.post("/api/auth/change-password", json={
        "user_id": "ADMIN001",
        "old_password": "Admin@123",
        "new_password": "SecureAdmin@2026!"
    })
    assert res.status_code == 200

    # Old password should now fail
    res_old = client.post("/api/auth/login", json={
        "user_id": "ADMIN001",
        "password": "Admin@123"
    })
    assert res_old.status_code == 401

    # New password should succeed and must_change_password should be False
    res_new = client.post("/api/auth/login", json={
        "user_id": "ADMIN001",
        "password": "SecureAdmin@2026!"
    })
    assert res_new.status_code == 200
    assert res_new.json()["must_change_password"] is False

    # Reset back for predictable test idempotency
    client.post("/api/auth/change-password", json={
        "user_id": "ADMIN001",
        "old_password": "SecureAdmin@2026!",
        "new_password": "Admin@123"
    })
    from app.database import SessionLocal
    from app.models import UserAccount
    db = SessionLocal()
    adm = db.query(UserAccount).filter_by(user_id="ADMIN001").first()
    if adm:
        adm.must_change_password = True
        db.commit()
    db.close()

def test_customer_registration_and_login():
    """
    Test customer registration, authentication, and isolation.
    """
    test_user_id = "CUS-TEST-REG-01"
    reg_res = client.post("/api/auth/register", json={
        "user_id": test_user_id,
        "password": "CustomerSecret@123",
        "full_name": "Test Registered User",
        "email": "testuser@example.com"
    })
    # Accept 200 or 409 if already registered
    assert reg_res.status_code in [200, 409]

    # Login
    login_res = client.post("/api/auth/login", json={
        "user_id": test_user_id,
        "password": "CustomerSecret@123"
    })
    assert login_res.status_code == 200
    user_data = login_res.json()
    assert user_data["user_id"] == test_user_id
    assert user_data["role"] == "customer"

def test_admin_registered_users_read_only_endpoint():
    """
    Admin can inspect registered users and imported dataset profiles.
    Endpoint is strictly protected by admin credentials.
    """
    # Unauthorized request without admin header
    res_unauth = client.get("/api/admin/registered-users")
    assert res_unauth.status_code == 401

    # Authorized request with master admin key
    headers = {"X-Admin-Key": settings.ADMIN_SECRET_KEY}
    res_auth = client.get("/api/admin/registered-users", headers=headers)
    assert res_auth.status_code == 200
    data = res_auth.json()
    assert "summary" in data
    assert data["summary"]["total_imported_profiles"] == 200
    assert data["summary"]["total_registered_accounts"] >= 1
    assert len(data["imported_profiles"]) == 200

def test_admin_inspect_user_detail_read_only():
    """
    Admin can inspect individual imported profile or registered user.
    """
    headers = {"X-Admin-Key": settings.ADMIN_SECRET_KEY}
    res = client.get("/api/admin/registered-users/CUS-06ISGGSQ", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["record_id"] == "CUS-06ISGGSQ"
    assert data["is_imported_profile"] is True
    assert "password_hash" not in str(data)  # Never expose password hash!
    assert "default_password" not in str(data)  # Passwords removed from dataset inspection

def test_admin_list_products_endpoint():
    """
    Test admin products listing endpoint and fallback behavior.
    """
    headers = {"X-Admin-Key": settings.ADMIN_SECRET_KEY}
    res = client.get("/api/admin/products", headers=headers)
    assert res.status_code == 200
    products = res.json()
    assert isinstance(products, list)
    assert len(products) > 0
    assert "id" in products[0]

def test_200_demo_customer_accounts_uniqueness_and_provisioning():
    """
    Verify all 200 synthetic demo customers are provisioned in user_accounts
    with unique usernames (profile_id), must_change_password=True,
    and hashed credentials.
    """
    from app.database import SessionLocal
    from app.models import UserAccount
    db = SessionLocal()
    try:
        accounts = db.query(UserAccount).filter(UserAccount.linked_profile_id != None).all()
        assert len(accounts) == 200, f"Expected 200 demo customer accounts, found {len(accounts)}"
        user_ids = [a.user_id for a in accounts]
        assert len(set(user_ids)) == 200, "All 200 customer IDs must be strictly unique"
        for a in accounts:
            assert a.password_hash != "", "Password hash must not be empty"
            assert len(a.password_hash) > 20, "Must be a secure cryptographic hash"
            assert a.must_change_password is True, "Must require password change on first login"
    finally:
        db.close()

def test_admin_registered_customers_distinguishes_demo_from_real():
    """
    Admin registered users response clearly distinguishes synthetic demo accounts
    from direct customer registrations.
    """
    headers = {"X-Admin-Key": settings.ADMIN_SECRET_KEY}
    res = client.get("/api/admin/registered-users", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "registered_accounts" in data
    demo_accounts = [u for u in data["registered_accounts"] if u.get("is_synthetic_demo")]
    assert len(demo_accounts) == 200
    # No plaintext passwords exposed in admin registered users
    for u in data["registered_accounts"]:
        assert "password" not in u
        assert "password_hash" not in u


