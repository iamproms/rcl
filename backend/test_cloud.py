import os
os.environ["CLOUDINARY_URL"] = "cloudinary://123:abc@testcloud"
import cloudinary
import cloudinary.uploader
print("Config:", cloudinary.config().cloud_name)
try:
    content = b"fake_data"
    cloudinary.uploader.upload(content)
except Exception as e:
    print("Error:", e)
