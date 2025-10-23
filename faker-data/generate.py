#!/usr/bin/env python3
"""
Script principal para generar datos falsos del sistema RAG agrícola.
"""

import json
import csv
import argparse
import shutil
from datetime import datetime
from pathlib import Path

# Importar generadores
from generators.contracts import generate_contracts
from generators.orders import generate_orders
from generators.invoices import generate_invoices
from generators.sales import generate_sales


def create_output_directories(base_path):
    """Crea el directorio de salida."""
    base_path.mkdir(parents=True, exist_ok=True)
    return True


def save_json_file(data, filepath):
    """Guarda datos en formato JSON con formato legible."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def flatten_dict(d, parent_key='', sep='_'):
    """Aplana un diccionario anidado para CSV."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # Si es lista de dicts (items), convertir a JSON string
            if v and isinstance(v[0], dict):
                items.append((new_key, json.dumps(v, ensure_ascii=False)))
            else:
                items.append((new_key, json.dumps(v, ensure_ascii=False)))
        else:
            items.append((new_key, v))
    return dict(items)


def save_csv_file(data, filepath):
    """Guarda datos en formato CSV."""
    if not data:
        return

    # Aplanar todos los registros
    flattened_data = [flatten_dict(record) for record in data]

    # Obtener todos los campos únicos
    fieldnames = set()
    for record in flattened_data:
        fieldnames.update(record.keys())
    fieldnames = sorted(fieldnames)

    # Escribir CSV
    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(flattened_data)


def generate_all_data(args):
    """Genera todos los tipos de documentos."""
    output_path = Path(args.output)

    # Limpiar directorio si se solicita
    if args.clean and output_path.exists():
        print(f"🗑️  Limpiando directorio {output_path}...")
        shutil.rmtree(output_path)

    # Crear estructura de directorios
    print(f"📁 Creando estructura de directorios en {output_path}...")
    create_output_directories(output_path)

    metadata = {
        "generated_at": datetime.now().isoformat(),
        "total_documents": 0,
        "documents_by_type": {}
    }

    # Generar contratos
    if args.only is None or args.only == "contracts":
        print(f"\n📄 Generando {args.contracts} contratos...")
        contracts = generate_contracts(args.contracts)

        # Guardar en CSV
        filename = output_path / "contracts.csv"
        save_csv_file(contracts, filename)

        metadata["documents_by_type"]["contracts"] = args.contracts
        metadata["total_documents"] += args.contracts
        print(f"   ✅ {args.contracts} contratos generados")

    # Generar órdenes de compra
    if args.only is None or args.only == "orders":
        print(f"\n🛒 Generando {args.orders} órdenes de compra...")
        orders = generate_orders(args.orders)

        # Guardar en CSV
        filename = output_path / "purchase_orders.csv"
        save_csv_file(orders, filename)

        metadata["documents_by_type"]["purchase_orders"] = args.orders
        metadata["total_documents"] += args.orders
        print(f"   ✅ {args.orders} órdenes de compra generadas")

    # Generar facturas
    if args.only is None or args.only == "invoices":
        print(f"\n🧾 Generando {args.invoices} facturas...")
        invoices = generate_invoices(args.invoices)

        # Guardar en CSV
        filename = output_path / "invoices.csv"
        save_csv_file(invoices, filename)

        metadata["documents_by_type"]["invoices"] = args.invoices
        metadata["total_documents"] += args.invoices
        print(f"   ✅ {args.invoices} facturas generadas")

    # Generar ventas históricas
    if args.only is None or args.only == "sales":
        print(f"\n📊 Generando {args.sales} registros de ventas históricas...")
        sales = generate_sales(args.sales)

        # Guardar en CSV
        filename = output_path / "sales_data.csv"
        save_csv_file(sales, filename)

        metadata["documents_by_type"]["sales_history"] = args.sales
        metadata["total_documents"] += args.sales
        print(f"   ✅ {args.sales} registros de ventas generados")

    # Guardar metadata
    metadata_file = output_path / "metadata.json"
    save_json_file(metadata, metadata_file)

    # Resumen final
    print(f"\n{'='*60}")
    print(f"✨ Generación completada exitosamente!")
    print(f"{'='*60}")
    print(f"📍 Ubicación: {output_path.absolute()}")
    print(f"📊 Total de documentos: {metadata['total_documents']}")
    print(f"\nDetalles por tipo:")
    for doc_type, count in metadata["documents_by_type"].items():
        print(f"  - {doc_type}: {count}")
    print(f"\n{'='*60}")


def main():
    parser = argparse.ArgumentParser(
        description="Generador de datos falsos para sistema RAG agrícola",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:

  # Generar todos los datos con cantidades por defecto
  python generate.py

  # Generar cantidades personalizadas
  python generate.py --contracts 50 --orders 100 --invoices 200 --sales 500

  # Generar solo contratos
  python generate.py --only contracts

  # Limpiar datos previos antes de generar
  python generate.py --clean

  # Especificar directorio de salida personalizado
  python generate.py --output ./mis-datos
        """
    )

    parser.add_argument(
        '--contracts',
        type=int,
        default=20,
        help='Número de contratos a generar (default: 20)'
    )

    parser.add_argument(
        '--orders',
        type=int,
        default=50,
        help='Número de órdenes de compra a generar (default: 50)'
    )

    parser.add_argument(
        '--invoices',
        type=int,
        default=100,
        help='Número de facturas a generar (default: 100)'
    )

    parser.add_argument(
        '--sales',
        type=int,
        default=200,
        help='Número de registros de ventas a generar (default: 200)'
    )

    parser.add_argument(
        '--output',
        type=str,
        default='./generated-data',
        help='Directorio de salida (default: ./generated-data)'
    )

    parser.add_argument(
        '--only',
        type=str,
        choices=['contracts', 'orders', 'invoices', 'sales'],
        help='Generar solo un tipo específico de documento'
    )

    parser.add_argument(
        '--clean',
        action='store_true',
        help='Limpiar directorio de salida antes de generar'
    )

    args = parser.parse_args()

    # Banner
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🌾  Generador de Datos Agrícolas Falsos  🌾          ║
║                                                           ║
║     Sistema RAG para Productores Agrícolas                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)

    try:
        generate_all_data(args)
    except Exception as e:
        print(f"\n❌ Error durante la generación: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
