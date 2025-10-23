"""
Generador de datos históricos de ventas.
"""

import random
from datetime import datetime, timedelta
from faker import Faker
from data.products import PRODUCTOS_AGRICOLAS
from data.customers import CLIENTES

fake = Faker('es_AR')

PAYMENT_METHODS = [
    "transferencia",
    "cheque",
    "efectivo",
    "cheque_diferido",
    "cuenta_corriente"
]

SEASONS = {
    "verano": [12, 1, 2],
    "otoño": [3, 4, 5],
    "invierno": [6, 7, 8],
    "primavera": [9, 10, 11]
}


def get_season_products(month):
    """Retorna productos según la estación del año."""
    if month in SEASONS["verano"]:
        # Verano: más frutas y verduras
        categories = ["frutas", "verduras", "cereales"]
        weights = [0.4, 0.4, 0.2]
    elif month in SEASONS["otoño"]:
        # Otoño: cosecha de cereales
        categories = ["cereales", "frutas", "verduras"]
        weights = [0.6, 0.2, 0.2]
    elif month in SEASONS["invierno"]:
        # Invierno: forrajes y algunos cereales
        categories = ["cereales", "forrajes", "verduras"]
        weights = [0.4, 0.4, 0.2]
    else:  # primavera
        # Primavera: variado
        categories = ["cereales", "verduras", "forrajes"]
        weights = [0.4, 0.3, 0.3]

    category = random.choices(categories, weights=weights)[0]
    return random.choice(PRODUCTOS_AGRICOLAS[category])


def generate_sales(count=200):
    """
    Genera datos históricos de ventas.

    Args:
        count: Número de registros de ventas a generar

    Returns:
        Lista de diccionarios con ventas
    """
    sales = []

    # Generar ventas desde hace 2 años hasta hoy
    start_date = datetime.now() - timedelta(days=730)
    end_date = datetime.now()

    for i in range(count):
        # Fecha de venta aleatoria
        sale_date = fake.date_time_between(
            start_date=start_date,
            end_date=end_date
        )

        # Seleccionar producto según estación
        product = get_season_products(sale_date.month)

        # Cliente
        customer = random.choice(CLIENTES)

        # Cantidad según tipo de producto
        if product["unit"] == "kg":
            # Cereales: cantidades grandes
            if product["name"] in ["Soja", "Maíz", "Trigo Pan", "Cebada Cervecera", "Sorgo Granífero"]:
                quantity = random.randint(5000, 50000)
            else:  # Frutas y verduras
                quantity = random.randint(500, 10000)
        elif product["unit"] == "fardo":
            quantity = random.randint(20, 200)
        elif product["unit"] == "megafardo":
            quantity = random.randint(10, 100)
        else:  # unidad
            quantity = random.randint(100, 2000)

        # Precio con variación del ±10% respecto al rango base
        base_price = random.randint(*product["price_range"])
        price_variation = random.uniform(0.9, 1.1)
        price_per_unit = int(base_price * price_variation)

        total_amount = quantity * price_per_unit

        sale = {
            "id": f"SALE-{sale_date.year}-{i+1:04d}",
            "date": sale_date.date().isoformat(),
            "product": product["name"],
            "category": get_product_category(product["name"]),
            "quantity": quantity,
            "unit": product["unit"],
            "pricePerUnit": price_per_unit,
            "totalAmount": total_amount,
            "customer": customer["name"],
            "customerType": customer["type"],
            "customerLocation": customer["location"],
            "paymentMethod": random.choice(PAYMENT_METHODS),
            "season": get_season_name(sale_date.month),
            "notes": random.choice([
                "",
                "Cliente frecuente",
                "Pago al contado - descuento aplicado",
                "Entrega programada",
                "Cliente nuevo"
            ])
        }

        sales.append(sale)

    # Ordenar por fecha
    sales.sort(key=lambda x: x["date"])

    return sales


def get_product_category(product_name):
    """Retorna la categoría de un producto."""
    for category, products in PRODUCTOS_AGRICOLAS.items():
        for product in products:
            if product["name"] == product_name:
                return category
    return "otros"


def get_season_name(month):
    """Retorna el nombre de la estación según el mes."""
    for season, months in SEASONS.items():
        if month in months:
            return season
    return "desconocida"
