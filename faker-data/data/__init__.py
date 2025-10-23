"""
Módulo de datos para el generador de datos agrícolas.
"""

from .products import PRODUCTOS_AGRICOLAS, INSUMOS_AGRICOLAS
from .suppliers import PROVEEDORES
from .customers import CLIENTES

__all__ = [
    'PRODUCTOS_AGRICOLAS',
    'INSUMOS_AGRICOLAS',
    'PROVEEDORES',
    'CLIENTES',
]
