"""Shared constants for the smarthome app."""

# Smart module keys accepted by the consultation form and the frontend estimator.
SMART_MODULES: dict[str, str] = {
    "osvetlenie": "Inteligentné osvetlenie (DALI/RGBW)",
    "tienenie": "Automatické tienenie (žalúzie/rolety)",
    "klima": "Zónové vykurovanie a chladenie",
    "energia": "Energetický manažment (FVE + Wallbox)",
    "zabezpecenie": "Zabezpečenie, prístup a kamery",
    "audio": "Multi-room audio",
}

FLOORPLAN_ALLOWED_EXTENSIONS = (".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".webp")
