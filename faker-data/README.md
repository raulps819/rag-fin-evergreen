# Generador de Datos Falsos para RAG Agrícola

Este directorio contiene scripts en Python para generar datos de prueba realistas para el sistema RAG de productores agrícolas.

## 📋 Descripción

Genera datos falsos en español para:
- **Contratos agrícolas**: Contratos de venta, arrendamiento, y compra de insumos
- **Órdenes de compra**: Pedidos de semillas, fertilizantes, maquinaria, etc.
- **Facturas**: Facturas de ventas de productos agrícolas
- **Datos históricos de ventas**: Series de tiempo con ventas por producto, cliente y período

## 🚀 Instalación

```bash
# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

## 📦 Dependencias

- **Faker**: Generación de datos falsos con soporte para español
- **python-dateutil**: Manipulación de fechas

## 💻 Uso

### Generar todos los datos (recomendado)

```bash
python generate.py
```

Esto generará:
- 20 contratos
- 50 órdenes de compra
- 100 facturas
- 200 registros de ventas históricas

### Generar tipos específicos de documentos

```bash
# Solo contratos
python generate.py --only contracts

# Solo órdenes de compra
python generate.py --only orders

# Solo facturas
python generate.py --only invoices

# Solo ventas históricas
python generate.py --only sales
```

### Opciones personalizadas

```bash
# Especificar cantidad de documentos
python generate.py --contracts 50 --orders 100 --invoices 200 --sales 500

# Especificar directorio de salida
python generate.py --output ./mi-carpeta-datos

# Limpiar datos previos antes de generar
python generate.py --clean
```

## 📁 Estructura de Salida

Los datos generados se guardan en `./generated-data/` en **formato CSV**:

```
generated-data/
├── contracts/
│   └── contracts.csv
├── purchase-orders/
│   └── purchase_orders.csv
├── invoices/
│   └── invoices.csv
├── sales-history/
│   └── sales_data.csv
└── metadata.json
```

## 📄 Formato de Datos (CSV)

Los datos se generan en formato CSV con columnas aplanadas. Los campos anidados se separan con guión bajo (_).

### Contratos (`contracts/contracts.csv`)

**Columnas principales:**
- `id`: Identificador único (CONT-YYYY-NNN)
- `type`: Tipo de contrato (venta_producto, arrendamiento)
- `date`: Fecha del contrato
- `parties_seller_name`, `parties_seller_id`, `parties_seller_address`: Datos del vendedor
- `parties_buyer_name`, `parties_buyer_id`, `parties_buyer_address`: Datos del comprador
- `product_name`, `product_quantity`, `product_unit`, `product_pricePerUnit`, `product_totalAmount`: Producto vendido
- `terms_deliveryDate`, `terms_paymentTerms`, `terms_qualitySpecs`: Términos del contrato

### Órdenes de Compra (`purchase-orders/purchase_orders.csv`)

**Columnas principales:**
- `id`: Identificador único (OC-YYYY-NNNN)
- `date`: Fecha de la orden
- `supplier_name`, `supplier_id`, `supplier_contact`: Datos del proveedor
- `buyer_name`, `buyer_farm`: Datos del comprador
- `items`: Lista de productos (formato JSON string)
- `totalAmount`: Monto total
- `deliveryDate`: Fecha de entrega
- `status`: Estado (confirmada, pendiente, en_transito, entregada, cancelada)

### Facturas (`invoices/invoices.csv`)

**Columnas principales:**
- `id`: Número de factura (FACT-X-PPPP-NNNNNNNN)
- `type`: Tipo (A, B, C)
- `date`: Fecha de emisión
- `dueDate`: Fecha de vencimiento
- `seller_name`, `seller_cuit`, `seller_address`: Datos del vendedor
- `customer_name`, `customer_cuit`, `customer_type`: Datos del cliente
- `items`: Lista de productos (formato JSON string)
- `subtotal`, `iva`, `total`: Importes
- `paymentMethod`: Método de pago
- `status`: Estado (pagada, pendiente, vencida)

### Ventas Históricas (`sales-history/sales_data.csv`)

**Columnas principales:**
- `id`: Identificador único (SALE-YYYY-NNNN)
- `date`: Fecha de venta
- `product`: Nombre del producto
- `category`: Categoría (cereales, frutas, verduras, forrajes)
- `quantity`, `unit`: Cantidad y unidad
- `pricePerUnit`, `totalAmount`: Precios
- `customer`, `customerType`, `customerLocation`: Datos del cliente
- `paymentMethod`: Método de pago
- `season`: Estación del año (verano, otoño, invierno, primavera)

## 🌾 Datos Específicos del Sector Agrícola

El generador incluye datos realistas del sector:

### Productos Agrícolas
- Cereales: Soja, Maíz, Trigo, Cebada, Sorgo
- Forrajes: Alfalfa, Pasturas
- Frutas: Manzana, Pera, Uva, Durazno
- Verduras: Tomate, Lechuga, Zanahoria, Papa

### Insumos Agrícolas
- Semillas (híbridas, certificadas)
- Fertilizantes (NPK, urea, fosfato)
- Agroquímicos (herbicidas, insecticidas, fungicidas)
- Maquinaria (tractores, cosechadoras, sembradoras)

### Datos Financieros
- Moneda: Pesos argentinos ($)
- IVA: 21%
- Formas de pago: Transferencia, cheque, contado, 30/60/90 días
- Tipos de factura: A, B, C

## 🔧 Desarrollo

### Estructura del código

```
.
├── generate.py              # Script principal y CLI
├── generators/
│   ├── __init__.py
│   ├── contracts.py         # Generador de contratos
│   ├── orders.py            # Generador de órdenes de compra
│   ├── invoices.py          # Generador de facturas
│   └── sales.py             # Generador de ventas históricas
├── data/
│   ├── __init__.py
│   ├── products.py          # Catálogo de productos agrícolas
│   ├── suppliers.py         # Lista de proveedores
│   └── customers.py         # Lista de clientes
└── requirements.txt
```

### Agregar nuevos tipos de documentos

1. Crear generador en `generators/tu_generador.py`
2. Implementar función `generate_*()` que retorne una lista de diccionarios
3. Importar y agregar al script principal `generate.py`
4. Actualizar README.md

## 📊 Casos de Uso

Estos datos son útiles para:

1. **Desarrollo**: Probar la interfaz de chat sin datos reales
2. **Testing**: Validar funcionalidad de búsqueda y análisis
3. **Demos**: Mostrar capacidades del sistema RAG
4. **QA**: Verificar visualizaciones de datos (gráficos, tablas)
5. **Vectorización**: Generar embeddings para la base de datos vectorial

## ⚠️ Notas Importantes

- Todos los datos son **ficticios** y generados aleatoriamente
- Los nombres, direcciones y números de identificación **no son reales**
- No usar estos datos en producción o con clientes reales
- Los precios son aproximados al mercado agrícola argentino pero pueden variar

## 🤝 Contribuir

Para agregar más variedad a los datos generados:

1. Editar `data/products.py` para agregar productos
2. Modificar `data/suppliers.py` para más proveedores
3. Actualizar rangos de precios según mercado actual
4. Agregar más términos contractuales realistas

## 📝 Licencia

Parte del proyecto RAG Fin Evergreen - Uso interno
