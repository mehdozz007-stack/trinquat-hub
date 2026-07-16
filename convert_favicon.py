#!/usr/bin/env python3
"""
Script pour convertir favicon.png en favicon.ico
Utilise Pillow pour la conversion
"""

from PIL import Image
import os
import sys

def convert_png_to_ico(png_path, ico_path=None, size=256):
    """
    Convertit une image PNG en ICO
    
    Args:
        png_path: chemin du fichier PNG source
        ico_path: chemin du fichier ICO de destination (optionnel)
        size: taille en pixels (par défaut 256)
    """
    try:
        if not os.path.exists(png_path):
            print(f"❌ Erreur: Le fichier {png_path} n'existe pas")
            return False
        
        # Si pas de chemin ICO spécifié, utiliser le même nom avec extension .ico
        if ico_path is None:
            ico_path = os.path.splitext(png_path)[0] + ".ico"
        
        print(f"📖 Ouverture du fichier: {png_path}")
        img = Image.open(png_path)
        
        # Convertir en RGBA si nécessaire
        if img.mode != 'RGBA':
            print(f"🔄 Conversion du mode {img.mode} en RGBA")
            img = img.convert('RGBA')
        
        # Redimensionner à la taille désirée
        print(f"📏 Redimensionnement à {size}x{size} pixels")
        img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Créer aussi une version 16x16 pour les petites icônes
        img_small = img.resize((16, 16), Image.Resampling.LANCZOS)
        
        # Créer une version 32x32
        img_medium = img.resize((32, 32), Image.Resampling.LANCZOS)
        
        # Sauvegarder en ICO avec plusieurs tailles
        print(f"💾 Sauvegarde vers: {ico_path}")
        img_resized.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (256, 256)])
        
        print(f"✅ Conversion réussie!")
        print(f"   Fichier créé: {os.path.abspath(ico_path)}")
        return True
        
    except ImportError:
        print("❌ Erreur: Pillow n'est pas installé")
        print("   Installez-le avec: pip install Pillow")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la conversion: {e}")
        return False


if __name__ == "__main__":
    # Chemin par défaut
    png_file = "public/favicon.png"
    ico_file = "public/favicon.ico"
    
    # Accepter des arguments en ligne de commande
    if len(sys.argv) > 1:
        png_file = sys.argv[1]
    if len(sys.argv) > 2:
        ico_file = sys.argv[2]
    
    print("🎨 Convertisseur PNG → ICO")
    print("=" * 40)
    convert_png_to_ico(png_file, ico_file)
