"""
Image processing service for team logos and other uploads.
Handles image optimization, resizing, and format conversion.
"""
import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import UploadFile, HTTPException
import io

class ImageService:
    """Service for processing and optimizing images."""
    
    UPLOAD_DIR = Path("static/uploads/team_logos")
    MAX_SIZE_MB = 5
    MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    LOGO_SIZE = (200, 200)
    WEBP_QUALITY = 85
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
    
    @classmethod
    async def save_team_logo(cls, file: UploadFile, equipo_id: int) -> str:
        """
        Process and save team logo.
        
        Args:
            file: Uploaded file
            equipo_id: Team ID for filename
            
        Returns:
            Relative URL path to saved logo
            
        Raises:
            HTTPException: If file is invalid or too large
        """
        # Validate MIME type
        if file.content_type not in cls.ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no permitido. Usa JPEG, PNG o WebP."
            )
        
        # Read file content
        contents = await file.read()
        
        # Validate size
        if len(contents) > cls.MAX_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"El archivo es demasiado grande. Máximo {cls.MAX_SIZE_MB}MB."
            )
        
        try:
            # Open image with Pillow
            image = Image.open(io.BytesIO(contents))
            
            # Convert to RGB if necessary (for WebP without transparency)
            if image.mode in ('RGBA', 'LA', 'P'):
                # Keep transparency for WebP
                pass
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize image maintaining aspect ratio (cover mode)
            image.thumbnail(cls.LOGO_SIZE, Image.Resampling.LANCZOS)
            
            # Create a new image with target size and paste the resized image centered
            final_image = Image.new('RGBA' if image.mode == 'RGBA' else 'RGB', cls.LOGO_SIZE, (255, 255, 255, 0) if image.mode == 'RGBA' else (255, 255, 255))
            
            # Calculate position to center the image
            x = (cls.LOGO_SIZE[0] - image.width) // 2
            y = (cls.LOGO_SIZE[1] - image.height) // 2
            final_image.paste(image, (x, y))
            
            # Generate unique filename
            filename = f"team_{equipo_id}_{uuid.uuid4().hex[:12]}.webp"
            filepath = cls.UPLOAD_DIR / filename
            
            # Ensure directory exists
            cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            
            # Save as WebP
            final_image.save(
                filepath,
                format='WEBP',
                quality=cls.WEBP_QUALITY,
                method=6  # Best compression
            )
            
            # Return relative URL
            return f"/static/uploads/team_logos/{filename}"
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error al procesar la imagen: {str(e)}"
            )
    
    @classmethod
    def delete_team_logo(cls, logo_url: str) -> None:
        """
        Delete a team logo file from disk.
        
        Args:
            logo_url: URL path of the logo to delete
        """
        if not logo_url:
            return
        
        try:
            # Extract filename from URL
            filename = Path(logo_url).name
            filepath = cls.UPLOAD_DIR / filename
            
            # Delete file if it exists
            if filepath.exists():
                filepath.unlink()
        except Exception:
            # Silently fail - don't crash if file doesn't exist
            pass
