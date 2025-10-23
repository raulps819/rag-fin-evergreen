"""
Generador de contratos agrícolas.
"""

import random
from datetime import datetime, timedelta
from faker import Faker
from data.products import PRODUCTOS_AGRICOLAS
from data.customers import CLIENTES

fake = Faker('es_AR')

CONTRACT_TYPES = [
    "venta_producto",
    "compra_insumo",
    "arrendamiento",
]

PAYMENT_TERMS = [
    "Contado",
    "30 días",
    "60 días",
    "90 días",
    "50% anticipo - 50% a 30 días",
    "3 pagos mensuales",
]

FARMS = [
    "Finca El Roble", "Estancia La Esperanza", "Campo Los Aromos",
    "Establecimiento San Jorge", "Finca Santa Rosa", "Campo El Trébol",
    "Estancia Los Algarrobos", "Finca La Primavera", "Campo Don Pedro",
    "Establecimiento El Progreso", "Estancia Las Vertientes", "Campo La Aurora"
]


def generate_seller():
    """Genera datos de un vendedor (productor)."""
    return {
        "name": fake.name(),
        "id": f"DNI {fake.random_number(digits=8)}",
        "address": f"{random.choice(FARMS)}, Km {random.randint(1, 120)} Ruta {random.randint(1, 50)}",
        "phone": fake.phone_number()
    }


def generate_buyer():
    """Genera datos de un comprador (cliente)."""
    cliente = random.choice(CLIENTES)
    cuit_prefix = random.choice(["30", "33"])
    cuit_middle = fake.random_number(digits=8)
    cuit_suffix = random.randint(0, 9)

    return {
        "name": cliente["name"],
        "id": f"CUIT {cuit_prefix}-{cuit_middle}-{cuit_suffix}",
        "address": f"Av. {fake.street_name()} {random.randint(100, 9999)}, {cliente['location']}",
        "contact": fake.email()
    }


def generate_product_contract():
    """Genera un contrato de venta de producto."""
    # Seleccionar categoría y producto
    categoria = random.choice(list(PRODUCTOS_AGRICOLAS.keys()))
    producto_data = random.choice(PRODUCTOS_AGRICOLAS[categoria])

    # Cantidad según tipo de producto
    if categoria == "cereales":
        quantity = random.randint(10000, 100000)  # 10-100 toneladas
    elif categoria == "forrajes":
        quantity = random.randint(50, 500)  # fardos/megafardos
    else:  # frutas y verduras
        quantity = random.randint(1000, 20000)  # kg

    price_per_unit = random.randint(*producto_data["price_range"])
    total_amount = quantity * price_per_unit

    contract_date = fake.date_between(start_date='-2y', end_date='today')
    delivery_date = contract_date + timedelta(days=random.randint(30, 120))

    quality_spec = random.choice(producto_data["quality_specs"])

    return {
        "type": "venta_producto",
        "date": contract_date.isoformat(),
        "parties": {
            "seller": generate_seller(),
            "buyer": generate_buyer()
        },
        "product": {
            "name": producto_data["name"],
            "quantity": quantity,
            "unit": producto_data["unit"],
            "pricePerUnit": price_per_unit,
            "totalAmount": total_amount
        },
        "terms": {
            "deliveryDate": delivery_date.isoformat(),
            "paymentTerms": random.choice(PAYMENT_TERMS),
            "qualitySpecs": quality_spec
        }
    }


def generate_lease_contract():
    """Genera un contrato de arrendamiento."""
    contract_date = fake.date_between(start_date='-2y', end_date='today')
    start_date = contract_date + timedelta(days=random.randint(30, 90))
    duration_years = random.choice([1, 2, 3, 5])
    end_date = start_date + timedelta(days=365 * duration_years)

    hectares = random.randint(50, 1000)
    price_per_hectare = random.randint(15000, 45000)
    total_amount = hectares * price_per_hectare

    return {
        "type": "arrendamiento",
        "date": contract_date.isoformat(),
        "parties": {
            "owner": generate_seller(),
            "tenant": {
                "name": fake.name(),
                "id": f"DNI {fake.random_number(digits=8)}",
                "address": fake.address()
            }
        },
        "property": {
            "location": f"{random.choice(FARMS)}, {fake.city()}",
            "hectares": hectares,
            "pricePerHectare": price_per_hectare,
            "totalAmount": total_amount
        },
        "terms": {
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "duration": f"{duration_years} {'año' if duration_years == 1 else 'años'}",
            "paymentTerms": random.choice([
                "Anual por adelantado",
                "Semestral",
                "Trimestral",
                "Porcentaje de cosecha"
            ]),
            "allowedUse": random.choice([
                "Agricultura - Soja/Maíz",
                "Ganadería intensiva",
                "Agricultura diversificada",
                "Agricultura y ganadería mixta"
            ])
        }
    }


def generate_contracts(count=20):
    """
    Genera una lista de contratos agrícolas.

    Args:
        count: Número de contratos a generar

    Returns:
        Lista de diccionarios con contratos
    """
    contracts = []

    for i in range(count):
        contract_type = random.choices(
            ["venta_producto", "arrendamiento"],
            weights=[0.7, 0.3]  # 70% ventas, 30% arrendamientos
        )[0]

        if contract_type == "venta_producto":
            contract = generate_product_contract()
        else:
            contract = generate_lease_contract()

        # Agregar ID único
        year = datetime.fromisoformat(contract["date"]).year
        contract["id"] = f"CONT-{year}-{i+1:03d}"

        contracts.append(contract)

    return contracts
