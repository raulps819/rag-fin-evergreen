"""
Generador de facturas de venta de productos agrícolas.
"""

import random
from datetime import datetime, timedelta
from faker import Faker
from data.products import PRODUCTOS_AGRICOLAS
from data.customers import CLIENTES

fake = Faker('es_AR')

INVOICE_TYPES = ["A", "B", "C"]
IVA_RATE = 0.21  # 21%

PAYMENT_METHODS = [
    "transferencia",
    "cheque",
    "efectivo",
    "cheque_diferido",
    "cuenta_corriente"
]

FARMS = [
    "Campo Los Aromos", "Estancia La Esperanza", "Finca El Roble",
    "Establecimiento San Jorge", "Campo Don Pedro", "Finca Santa Rosa"
]


def generate_invoice_items():
    """Genera ítems de factura."""
    items = []
    num_items = random.randint(1, 4)

    # Seleccionar productos
    all_products = []
    for categoria, productos in PRODUCTOS_AGRICOLAS.items():
        all_products.extend([(p, categoria) for p in productos])

    selected_products = random.sample(all_products, min(num_items, len(all_products)))

    for product, categoria in selected_products:
        # Cantidad según categoría
        if categoria == "cereales":
            quantity = random.randint(5000, 50000)  # kg
        elif categoria == "forrajes":
            quantity = random.randint(20, 300)  # fardos/megafardos
        else:  # frutas y verduras
            if product["unit"] == "unidad":
                quantity = random.randint(100, 1000)
            else:
                quantity = random.randint(500, 10000)  # kg

        price_per_unit = random.randint(*product["price_range"])
        subtotal = quantity * price_per_unit

        items.append({
            "description": product["name"],
            "quantity": quantity,
            "unit": product["unit"],
            "pricePerUnit": price_per_unit,
            "subtotal": subtotal
        })

    return items


def generate_invoices(count=100):
    """
    Genera una lista de facturas.

    Args:
        count: Número de facturas a generar

    Returns:
        Lista de diccionarios con facturas
    """
    invoices = []

    for i in range(count):
        invoice_date = fake.date_between(start_date='-2y', end_date='today')
        year = invoice_date.year

        # Tipo de factura (mayoría tipo A)
        invoice_type = random.choices(
            INVOICE_TYPES,
            weights=[0.6, 0.3, 0.1]  # 60% A, 30% B, 10% C
        )[0]

        # Punto de venta
        punto_venta = random.randint(1, 10)

        # Número de factura
        numero_factura = i + random.randint(1, 100)

        # Generar vendedor (productor)
        seller_name = fake.name()
        seller_cuit_prefix = "20" if random.random() > 0.5 else "27"
        seller_cuit_middle = fake.random_number(digits=8)
        seller_cuit_suffix = random.randint(0, 9)

        # Seleccionar cliente
        customer = random.choice(CLIENTES)
        customer_cuit_prefix = random.choice(["30", "33"])
        customer_cuit_middle = fake.random_number(digits=8)
        customer_cuit_suffix = random.randint(0, 9)

        # Generar ítems
        items = generate_invoice_items()
        subtotal = sum(item["subtotal"] for item in items)

        # Calcular IVA según tipo de factura
        if invoice_type in ["A", "B"]:
            iva = int(subtotal * IVA_RATE)
            total = subtotal + iva
        else:  # Tipo C (IVA incluido)
            iva = 0
            total = subtotal

        # Fecha de vencimiento
        due_date = invoice_date + timedelta(days=random.choice([0, 30, 60, 90]))

        invoice = {
            "id": f"FACT-{invoice_type}-{punto_venta:04d}-{numero_factura:08d}",
            "type": invoice_type,
            "date": invoice_date.isoformat(),
            "dueDate": due_date.isoformat(),
            "seller": {
                "name": seller_name,
                "cuit": f"{seller_cuit_prefix}-{seller_cuit_middle}-{seller_cuit_suffix}",
                "address": f"{random.choice(FARMS)}, {fake.city()}",
                "phone": fake.phone_number()
            },
            "customer": {
                "name": customer["name"],
                "cuit": f"{customer_cuit_prefix}-{customer_cuit_middle}-{customer_cuit_suffix}",
                "address": f"{fake.street_name()} {random.randint(100, 9999)}, {customer['location']}",
                "type": customer["type"]
            },
            "items": items,
            "subtotal": subtotal,
            "iva": iva,
            "total": total,
            "paymentMethod": random.choice(PAYMENT_METHODS),
            "cae": f"{fake.random_number(digits=14)}",  # Código de Autorización Electrónico
            "caeExpiration": (invoice_date + timedelta(days=10)).isoformat(),
            "status": random.choices(
                ["pagada", "pendiente", "vencida"],
                weights=[0.7, 0.2, 0.1]
            )[0]
        }

        invoices.append(invoice)

    return invoices
