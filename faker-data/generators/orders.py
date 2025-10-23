"""
Generador de órdenes de compra de insumos agrícolas.
"""

import random
from datetime import datetime, timedelta
from faker import Faker
from data.products import INSUMOS_AGRICOLAS
from data.suppliers import PROVEEDORES

fake = Faker('es_AR')

ORDER_STATUS = [
    "confirmada",
    "pendiente",
    "en_transito",
    "entregada",
    "cancelada"
]

FARMS = [
    "Finca El Roble", "Estancia La Esperanza", "Campo Los Aromos",
    "Establecimiento San Jorge", "Finca Santa Rosa", "Campo El Trébol",
    "Estancia Los Algarrobos", "Finca La Primavera", "Campo Don Pedro",
    "Establecimiento El Progreso"
]


def generate_order_items(supplier_type):
    """Genera ítems de la orden según el tipo de proveedor."""
    items = []
    num_items = random.randint(1, 5)

    # Filtrar insumos según tipo de proveedor
    if supplier_type == "semillas":
        available_products = INSUMOS_AGRICOLAS["semillas"]
    elif supplier_type == "fertilizantes":
        available_products = INSUMOS_AGRICOLAS["fertilizantes"]
    elif supplier_type == "agroquimicos":
        available_products = INSUMOS_AGRICOLAS["agroquimicos"]
    elif supplier_type == "maquinaria":
        available_products = INSUMOS_AGRICOLAS["maquinaria"]
    elif supplier_type == "semillas_fertilizantes":
        available_products = INSUMOS_AGRICOLAS["semillas"] + INSUMOS_AGRICOLAS["fertilizantes"]
    else:  # general
        available_products = []
        for category in INSUMOS_AGRICOLAS.values():
            available_products.extend(category)

    for _ in range(num_items):
        product = random.choice(available_products)

        # Cantidad según tipo de producto
        if "bolsa" in product["unit"]:
            quantity = random.randint(5, 50)
        elif "tonelada" in product["unit"]:
            quantity = random.randint(1, 20)
        elif "litro" in product["unit"]:
            quantity = random.randint(20, 200)
        else:  # unidad (maquinaria)
            quantity = random.randint(1, 3)

        price_per_unit = random.randint(*product["price_range"])
        total = quantity * price_per_unit

        items.append({
            "product": product["name"],
            "quantity": quantity,
            "unit": product["unit"],
            "pricePerUnit": price_per_unit,
            "total": total,
            "specs": product.get("specs", "")
        })

    return items


def generate_orders(count=50):
    """
    Genera una lista de órdenes de compra.

    Args:
        count: Número de órdenes a generar

    Returns:
        Lista de diccionarios con órdenes de compra
    """
    orders = []

    for i in range(count):
        order_date = fake.date_between(start_date='-1y', end_date='today')
        delivery_date = order_date + timedelta(days=random.randint(7, 45))

        # Seleccionar proveedor
        supplier = random.choice(PROVEEDORES)

        # Generar ítems
        items = generate_order_items(supplier["type"])
        total_amount = sum(item["total"] for item in items)

        # Generar CUIT del proveedor
        cuit_prefix = "30"
        cuit_middle = fake.random_number(digits=8)
        cuit_suffix = random.randint(0, 9)

        # Estado de la orden (mayoría confirmadas/entregadas)
        status_weights = [0.4, 0.1, 0.15, 0.3, 0.05]  # confirmada, pendiente, en_transito, entregada, cancelada
        status = random.choices(ORDER_STATUS, weights=status_weights)[0]

        year = order_date.year
        order = {
            "id": f"OC-{year}-{i+1:04d}",
            "date": order_date.isoformat(),
            "supplier": {
                "name": supplier["name"],
                "id": f"CUIT {cuit_prefix}-{cuit_middle}-{cuit_suffix}",
                "contact": supplier["contact"],
                "phone": supplier.get("phone", fake.phone_number())
            },
            "buyer": {
                "name": fake.name(),
                "farm": random.choice(FARMS),
                "phone": fake.phone_number(),
                "email": fake.email()
            },
            "items": items,
            "totalAmount": total_amount,
            "deliveryDate": delivery_date.isoformat(),
            "deliveryAddress": f"{random.choice(FARMS)}, {fake.city()}",
            "status": status,
            "notes": random.choice([
                "",
                "Entregar en horario de mañana",
                "Coordinar entrega con anticipación",
                "Requiere descarga con grúa",
                "Pago contra entrega"
            ])
        }

        orders.append(order)

    return orders
