"""
Catálogo de productos agrícolas e insumos.
"""

PRODUCTOS_AGRICOLAS = {
    "cereales": [
        {
            "name": "Soja",
            "unit": "kg",
            "price_range": (300, 400),
            "quality_specs": [
                "Humedad máx. 14%",
                "Proteína mín. 36%",
                "Materia extraña máx. 2%",
                "Granos dañados máx. 3%"
            ]
        },
        {
            "name": "Maíz",
            "unit": "kg",
            "price_range": (150, 220),
            "quality_specs": [
                "Humedad máx. 14.5%",
                "Quebrados máx. 3%",
                "Materia extraña máx. 2%",
                "Grano negro máx. 2%"
            ]
        },
        {
            "name": "Trigo Pan",
            "unit": "kg",
            "price_range": (250, 300),
            "quality_specs": [
                "Proteína mín. 10.5%",
                "Humedad máx. 12%",
                "Peso hectolitro mín. 76 kg/hl",
                "Gluten húmedo mín. 25%"
            ]
        },
        {
            "name": "Cebada Cervecera",
            "unit": "kg",
            "price_range": (180, 240),
            "quality_specs": [
                "Humedad máx. 13%",
                "Proteína 9-11.5%",
                "Calibre mín. 85%",
                "Granos verdes máx. 3%"
            ]
        },
        {
            "name": "Sorgo Granífero",
            "unit": "kg",
            "price_range": (140, 190),
            "quality_specs": [
                "Humedad máx. 14%",
                "Materia extraña máx. 2%",
                "Granos dañados máx. 3%"
            ]
        },
    ],
    "forrajes": [
        {
            "name": "Alfalfa en Fardo",
            "unit": "fardo",
            "price_range": (2500, 3500),
            "quality_specs": [
                "Hojas verdes mín. 40%",
                "Humedad máx. 15%",
                "Sin moho",
                "Peso promedio 20-25 kg"
            ]
        },
        {
            "name": "Pastura Megafardos",
            "unit": "megafardo",
            "price_range": (15000, 22000),
            "quality_specs": [
                "Peso 400-500 kg",
                "Humedad máx. 18%",
                "Proteína mín. 8%"
            ]
        },
    ],
    "frutas": [
        {
            "name": "Manzana Red Delicious",
            "unit": "kg",
            "price_range": (200, 350),
            "quality_specs": [
                "Calibre 70-85mm",
                "Sin daños mecánicos",
                "Color rojo intenso mín. 60%"
            ]
        },
        {
            "name": "Pera Williams",
            "unit": "kg",
            "price_range": (180, 300),
            "quality_specs": [
                "Calibre 60-75mm",
                "Firmeza adecuada",
                "Sin manchas"
            ]
        },
        {
            "name": "Uva de Mesa",
            "unit": "kg",
            "price_range": (250, 450),
            "quality_specs": [
                "Racimos uniformes",
                "Sin bayas dañadas",
                "Brix mín. 16%"
            ]
        },
        {
            "name": "Durazno",
            "unit": "kg",
            "price_range": (220, 380),
            "quality_specs": [
                "Calibre 55-70mm",
                "Madurez óptima",
                "Sin golpes"
            ]
        },
    ],
    "verduras": [
        {
            "name": "Tomate Redondo",
            "unit": "kg",
            "price_range": (150, 280),
            "quality_specs": [
                "Calibre medio-grande",
                "Color rojo parejo",
                "Firmeza buena"
            ]
        },
        {
            "name": "Lechuga Mantecosa",
            "unit": "unidad",
            "price_range": (80, 150),
            "quality_specs": [
                "Peso mín. 250g",
                "Hojas verdes sin manchas",
                "Cogollo firme"
            ]
        },
        {
            "name": "Zanahoria",
            "unit": "kg",
            "price_range": (90, 170),
            "quality_specs": [
                "Calibre uniforme",
                "Sin bifurcaciones",
                "Color naranja intenso"
            ]
        },
        {
            "name": "Papa Spunta",
            "unit": "kg",
            "price_range": (120, 220),
            "quality_specs": [
                "Calibre 40-80mm",
                "Sin verdeo",
                "Piel lisa"
            ]
        },
    ]
}

INSUMOS_AGRICOLAS = {
    "semillas": [
        {
            "name": "Semilla de Soja RR",
            "unit": "bolsa 40kg",
            "price_range": (180000, 250000),
            "specs": "Germinación mín. 85%, Pureza 99%"
        },
        {
            "name": "Semilla de Maíz Híbrido",
            "unit": "bolsa 20kg",
            "price_range": (220000, 320000),
            "specs": "Germinación mín. 90%, Pureza 98%"
        },
        {
            "name": "Semilla de Trigo",
            "unit": "bolsa 40kg",
            "price_range": (95000, 135000),
            "specs": "Germinación mín. 85%, Certificada"
        },
        {
            "name": "Semilla de Alfalfa",
            "unit": "bolsa 25kg",
            "price_range": (285000, 380000),
            "specs": "Pureza 98%, Fiscalizada"
        },
    ],
    "fertilizantes": [
        {
            "name": "Urea Granulada 46%",
            "unit": "tonelada",
            "price_range": (420000, 520000),
            "specs": "Nitrógeno 46%"
        },
        {
            "name": "Fosfato Diamónico (DAP)",
            "unit": "tonelada",
            "price_range": (650000, 780000),
            "specs": "N 18%, P2O5 46%"
        },
        {
            "name": "NPK 15-15-15",
            "unit": "tonelada",
            "price_range": (580000, 690000),
            "specs": "Equilibrado"
        },
        {
            "name": "Sulfato de Amonio",
            "unit": "tonelada",
            "price_range": (380000, 460000),
            "specs": "N 21%, S 24%"
        },
    ],
    "agroquimicos": [
        {
            "name": "Glifosato 66% SG",
            "unit": "litro",
            "price_range": (3500, 5200),
            "specs": "Herbicida sistémico no selectivo"
        },
        {
            "name": "2,4-D Amina",
            "unit": "litro",
            "price_range": (2800, 4100),
            "specs": "Herbicida selectivo auxínico"
        },
        {
            "name": "Clorpirifos 48%",
            "unit": "litro",
            "price_range": (4200, 6300),
            "specs": "Insecticida organofosforado"
        },
        {
            "name": "Cipermetrina 25%",
            "unit": "litro",
            "price_range": (3800, 5600),
            "specs": "Insecticida piretroide"
        },
        {
            "name": "Tebuconazole 25%",
            "unit": "litro",
            "price_range": (6500, 9200),
            "specs": "Fungicida sistémico triazol"
        },
    ],
    "maquinaria": [
        {
            "name": "Tractor 75 HP",
            "unit": "unidad",
            "price_range": (18000000, 25000000),
            "specs": "4x4, cabina con A/C"
        },
        {
            "name": "Cosechadora Autopropulsada",
            "unit": "unidad",
            "price_range": (45000000, 65000000),
            "specs": "Plataforma maicera/sojera 6m"
        },
        {
            "name": "Sembradora de Grano Fino",
            "unit": "unidad",
            "price_range": (8500000, 12500000),
            "specs": "21 líneas a 17.5cm, tolva 2500L"
        },
        {
            "name": "Pulverizadora Autopropulsada",
            "unit": "unidad",
            "price_range": (28000000, 38000000),
            "specs": "3000L, botalón 24m"
        },
        {
            "name": "Rastra de Discos",
            "unit": "unidad",
            "price_range": (4200000, 6800000),
            "specs": "24 discos, 2.5m de labor"
        },
    ]
}
