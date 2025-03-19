from werkzeug.security import generate_password_hash, check_password_hash

# The stored hash from the database
stored_hash = "pbkdf2:sha256:1000000$JWUO77cj0V5shqSz$ac43c807bca68d63e2dd5f7365d1e418871dafb5ba6c1a40d6078075825c0922"
password = "password123"

# Verify the password
result = check_password_hash(stored_hash, password)
print(f"Password verification result: {result}")