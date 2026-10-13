"""
Génère les images de la marque dans public/ : favicon, icônes d'application, image de partage (Open Graph).

Marque provisoire : une émeraude taillée aux couleurs du site. Pour utiliser un vrai logo,
remplacer GEM / draw_gem() puis relancer :   python scripts/brand-assets.py
Dépendance : Pillow (pip install pillow). Polices : Georgia et Segoe UI (Windows).
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PUBLIC = Path(__file__).resolve().parent.parent / "public"
FONTS = Path("C:/Windows/Fonts")

# Couleurs de src/index.css
EMERALD_900 = "#042f1d"
EMERALD_700 = "#075c37"
EMERALD_600 = "#0b804d"
EMERALD_500 = "#109e61"
EMERALD_300 = "#5fd39a"
WHITE = "#ffffff"

# Émeraude taillée (coordonnées sur 100) : contour octogonal et table centrale.
OUTER = [(30, 10), (70, 10), (90, 30), (90, 70), (70, 90), (30, 90), (10, 70), (10, 30)]
TABLE = [(38, 26), (62, 26), (74, 38), (74, 62), (62, 74), (38, 74), (26, 62), (26, 38)]
FACET_COLORS = [EMERALD_500, EMERALD_300, EMERALD_500, EMERALD_600, EMERALD_700, EMERALD_700, EMERALD_600, EMERALD_500]


def draw_gem(draw: ImageDraw.ImageDraw, x: float, y: float, size: float) -> None:
    """Dessine l'émeraude dans le carré (x, y, size)."""
    k = size / 100
    pt = lambda p: (x + p[0] * k, y + p[1] * k)
    for i in range(8):
        a, b = OUTER[i], OUTER[(i + 1) % 8]
        c, d = TABLE[(i + 1) % 8], TABLE[i]
        draw.polygon([pt(a), pt(b), pt(c), pt(d)], fill=FACET_COLORS[i])
    draw.polygon([pt(p) for p in TABLE], fill=EMERALD_500)
    # Reflet sur la table
    draw.polygon([pt((40, 30)), pt((56, 30)), pt((44, 46)), pt((32, 46)), pt((32, 38))], fill=EMERALD_300)
    line = max(1, round(size / 70))
    for i in range(8):
        draw.line([pt(OUTER[i]), pt(TABLE[i])], fill=EMERALD_900, width=line)
    draw.line([pt(p) for p in OUTER + [OUTER[0]]], fill=EMERALD_900, width=line, joint="curve")
    draw.line([pt(p) for p in TABLE + [TABLE[0]]], fill=EMERALD_900, width=line, joint="curve")


def supersampled(width: int, height: int, paint, background=(0, 0, 0, 0), factor: int = 4) -> Image.Image:
    """Dessin en haute résolution puis réduction : contours lissés."""
    big = Image.new("RGBA", (width * factor, height * factor), background)
    paint(ImageDraw.Draw(big), factor)
    return big.resize((width, height), Image.LANCZOS)


def app_icon(size: int) -> Image.Image:
    """Icône carrée à fond vert profond (écran d'accueil mobile, manifeste)."""
    def paint(d, f):
        s = size * f
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=s * 0.22, fill=EMERALD_900)
        draw_gem(d, s * 0.15, s * 0.15, s * 0.7)
    return supersampled(size, size, paint)


def favicon(size: int) -> Image.Image:
    def paint(d, f):
        draw_gem(d, 0, 0, size * f)
    return supersampled(size, size, paint)


def og_image() -> Image.Image:
    """Image de partage 1200 x 630 (Facebook, WhatsApp, LinkedIn, X)."""
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), EMERALD_900)
    # Dégradé vertical vert profond → émeraude
    top, bottom = (4, 47, 29), (11, 128, 77)
    grad = ImageDraw.Draw(img)
    for yy in range(H):
        t = yy / (H - 1)
        grad.line([(0, yy), (W, yy)], fill=tuple(round(top[i] + (bottom[i] - top[i]) * t * 0.55) for i in range(3)))
    gem = supersampled(260, 260, lambda d, f: draw_gem(d, 0, 0, 260 * f))
    img.paste(gem, (110, (H - 260) // 2), gem)
    d = ImageDraw.Draw(img)
    title = ImageFont.truetype(str(FONTS / "georgiab.ttf"), 84)
    tagline = ImageFont.truetype(str(FONTS / "segoeui.ttf"), 36)
    small = ImageFont.truetype(str(FONTS / "segoeuib.ttf"), 28)
    x = 430
    d.text((x, 180), "Emeraude", font=title, fill=WHITE)
    d.text((x, 275), "Africa", font=title, fill=EMERALD_300)
    d.text((x, 390), "Investissement immobilier participatif", font=tagline, fill=WHITE)
    d.text((x, 438), "Sénégal · Afrique de l'Ouest · Diaspora", font=tagline, fill="#cdeedd")
    d.text((x, 510), "Mobile Money · Wave · Carte bancaire", font=small, fill=EMERALD_300)
    return img


def favicon_svg() -> str:
    facets = []
    for i in range(8):
        a, b = OUTER[i], OUTER[(i + 1) % 8]
        c, dd = TABLE[(i + 1) % 8], TABLE[i]
        pts = " ".join(f"{p[0]},{p[1]}" for p in (a, b, c, dd))
        facets.append(f'<polygon points="{pts}" fill="{FACET_COLORS[i]}"/>')
    table = " ".join(f"{p[0]},{p[1]}" for p in TABLE)
    outer = " ".join(f"{p[0]},{p[1]}" for p in OUTER)
    ridges = "".join(f'<line x1="{OUTER[i][0]}" y1="{OUTER[i][1]}" x2="{TABLE[i][0]}" y2="{TABLE[i][1]}"/>' for i in range(8))
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        + "".join(facets)
        + f'<polygon points="{table}" fill="{EMERALD_500}"/>'
        + f'<polygon points="40,30 56,30 44,46 32,46 32,38" fill="{EMERALD_300}"/>'
        + f'<g stroke="{EMERALD_900}" stroke-width="1.6" fill="none" stroke-linejoin="round">{ridges}'
        + f'<polygon points="{outer}"/><polygon points="{table}"/></g></svg>\n'
    )


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    (PUBLIC / "favicon.svg").write_text(favicon_svg(), encoding="utf-8")
    favicon(32).save(PUBLIC / "favicon-32.png")
    favicon(48).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    app_icon(180).save(PUBLIC / "apple-touch-icon.png")
    app_icon(192).save(PUBLIC / "icon-192.png")
    app_icon(512).save(PUBLIC / "icon-512.png")
    og_image().save(PUBLIC / "og-image.png", optimize=True)
    print("Images de la marque générées dans", PUBLIC)


if __name__ == "__main__":
    main()
