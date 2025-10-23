"""
Módulo de generadores de documentos agrícolas.
"""

from .contracts import generate_contracts
from .orders import generate_orders
from .invoices import generate_invoices
from .sales import generate_sales

__all__ = [
    'generate_contracts',
    'generate_orders',
    'generate_invoices',
    'generate_sales',
]
