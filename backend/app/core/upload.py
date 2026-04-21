import os
import re
import tempfile
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from app.core.config import settings

async def upload_to_cloudinary(file: UploadFile, folder: str = "rcl-uploads", resource_type: str = "auto"):
    """
    Uploads a file to Cloudinary.
    - resource_type: "image", "raw", "video", or "auto"
    """
    cloudinary_url = getattr(settings, "CLOUDINARY_URL", "") or os.environ.get("CLOUDINARY_URL", "")
    
    # Auto-fix common Render copy-paste error
    if cloudinary_url.startswith("CLOUDINARY_URL="):
        cloudinary_url = cloudinary_url.replace("CLOUDINARY_URL=", "", 1)

    if not cloudinary_url:
        print("DEBUG: No CLOUDINARY_URL found for persistent upload")
        return None

    try:
        # Parse credentials
        match = re.search(r"cloudinary://([^:]+):([^@]+)@([^/?#\s]+)", cloudinary_url)
        if not match:
            print(f"DEBUG: Malformed CLOUDINARY_URL: {cloudinary_url}")
            return None
        
        api_key = match.group(1)
        api_secret = match.group(2)
        cloud_name = match.group(3).strip("/")
        
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        
        # Ensure we are at the start of the file if it's been read before
        await file.seek(0)
        content = await file.read()
        suffix = os.path.splitext(file.filename)[1]
        
        # Use a temporary file to upload
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
            
        try:
            # Detect resource type
            suffix = os.path.splitext(file.filename)[1].lower()
            if suffix == '.pdf':
                final_resource_type = "raw"
            else:
                final_resource_type = resource_type # Default auto
                
            print(f"DEBUG: Attempting Cloudinary upload for {file.filename} (final_resource_type={final_resource_type})")
            result = cloudinary.uploader.upload(
                tmp_path,
                folder=folder,
                resource_type=final_resource_type,
                type="upload",
                access_mode="public",
                use_filename=True,
                unique_filename=True
            )
            print(f"DEBUG: Cloudinary upload SUCCESS: {result.get('secure_url')}")
            return result["secure_url"]
        except Exception as e:
            print(f"DEBUG: Cloudinary UPLOAD FAILED for {file.filename}: {str(e)}")
            return None
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
                
    except Exception as e:
        print(f"DEBUG: Cloudinary Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def save_local_file(file_content, filename, upload_dir="static/uploads"):
    """Fallback for local development"""
    os.makedirs(upload_dir, exist_ok=True)
    file_extension = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    return f"/{file_path}"
