from PIL import Image, ImageDraw, ImageFont
import os

# Dimensions OpenGraph standard: 1200x630
width, height = 1200, 630

# Créer une image de fond blanc
image = Image.new('RGB', (width, height), color=(255, 255, 255))

# Charger le logo
logo_path = 'src/assets/logo.png'
if os.path.exists(logo_path):
    try:
        logo = Image.open(logo_path)
        # Convertir en RGB si transparent
        if logo.mode == 'RGBA':
            logo = logo.convert('RGB')
        # Redimensionner le logo en gardant ses proportions (max 1000 de largeur)
        logo.thumbnail((1000, 500), Image.Resampling.LANCZOS)
        # Centrer le logo
        logo_x = (width - logo.width) // 2
        logo_y = (height - logo.height) // 2
        # Paster le logo
        image.paste(logo, (logo_x, logo_y))
        # Sauvegarder l'image
        output_path = 'public/og-image.jpg'
        image.save(output_path, quality=95)
        print(f"✅ Logo chargé: {logo_path}")
        print(f"✅ Image OpenGraph générée: {output_path}")
        print(f"Dimensions: {width}x{height}px")
    except Exception as e:
        print(f"⚠️  Erreur chargement logo: {e}")
else:
    print(f"⚠️  Logo non trouvé à: {logo_path}")
