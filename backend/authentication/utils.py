from cryptography.fernet import Fernet
from django.conf import settings
import hashlib

# Initialize Cipher using the ENCRYPTION_KEY
cipher = Fernet(settings.ENCRYPTION_KEY)

def hash_mobile_number(mobile_number):
    """Hashes the mobile number using SHA-256."""
    return hashlib.sha256(mobile_number.encode('utf-8')).hexdigest()


def encrypt(data):
    """
    Encrypts plain text data.
    """
    if isinstance(data, str):  # Convert string to bytes
        data = data.encode('utf-8')
    return cipher.encrypt(data).decode('utf-8')  # Return encrypted string


def decrypt(encrypted_data):
    """
    Decrypts encrypted data.
    """
    return cipher.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')  # Return plain text
