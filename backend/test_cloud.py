import cloudinary
import cloudinary.uploader
import sys

cloudinary.config(cloud_name="demo", api_key="123", api_secret="abc")

try:
    cloudinary.uploader.upload(b"fake_image_bytes")
    print("Raw bytes SUCCESS")
except Exception as e:
    print("Raw bytes FAIL:", str(e))
