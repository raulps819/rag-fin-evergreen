# Matriz de evaluación para resultados RAG (GPT 5, GPT 5 MINI, GPT 5 NANO)

## Contexto y referencias
- Respuestas esperadas en `RespuestasCorrectas.txt` (6 preguntas: gastos fertilizantes Q4-2025, proveedor precio/kg, ventas 2023-2025, pesticidas anual, condiciones de pago maquinaria, cultivo más rentable últimos 2 trimestres).
- Conversaciones por modelo en `GPT 5.txt`, `GPT 5 MINI.txt`, `GPT 5 NANO.txt`, cada una con `messages`, `sources` y metadatos (`created_at`, `updated_at`).
- Objetivo: evaluar consistencia técnica del pipeline RAG y el valor que entrega cada modelo a negocio sin modificar aún las respuestas.

## Escala base de puntuación
- 0 = incumple: dato incorrecto, ausencia de evidencia o impacto negativo.
- 1 = parcial: responde con lagunas, formatos inconsistentes o requiere verificación manual adicional.
- 2 = satisfactorio: cumple criterio con precisión, trazabilidad y utilidad inmediata.
- Para métricas operativas cuantitativas registrar valores reales (ms, tokens, COP) además de la calificación 0-2.

## Dimensiones técnicas
| Código | Dimensión | Qué se evalúa | Métricas cuantitativas sugeridas | Señales cualitativas | Relevancia |
| --- | --- | --- | --- | --- | --- |
| T1 | Recuperación y cobertura documental | Pertinencia de los chunks recuperados para cada pregunta. | % de preguntas con todos los documentos correctos; ratio señal/ruido en `sources`; score de relevancia promedio. | El modelo cita documentos exactos y evita data fuera de corpus. | Alta para ingeniería RAG.
| T2 | Exactitud factual y numérica | Coincidencia con `RespuestasCorrectas.txt` (tolerancias ±1% para montos, coincidencia exacta para categorías). | Error absoluto medio (e); tasa de coincidencia total. | Explicita cálculos y redondeos, conserva monedas/unidades. | Crítica para negocio.
| T3 | Integridad / completitud | Cobertura de todos los subcomponentes solicitados (listas, series temporales, comparativos). | # de elementos respondidos / # esperados; % de preguntas con follow-ups opcionales. | Usa tablas/listas cuando el usuario las necesita; declara falta de datos cuando aplica. | Negocio + Producto.
| T4 | Consistencia temporal y de unidades | Respeta periodos (ej. trimestre, últimos 3 años) y unidades (COP, kg). | # de referencias explícitas de fecha/unidad; errores detectados. | Menciona periodo evaluado y aclara si hay datos faltantes. | Negocio.
| T5 | Razonamiento y narrativa técnica | Clara cadena lógica al justificar cifras y tendencias. | Longitud media de explicaciones relevantes vs relleno; puntuación de legibilidad (Flesch). | Transiciones lógicas, destaca supuestos y limita al contexto. | Producto.
| T6 | Citas y trazabilidad | Calidad de los `sources` añadidos por respuesta. | % de mensajes con `sources`; nº de documentos únicos citados; cobertura vs total recuperado. | Referencias al nombre del archivo/csv y chunk cuando resume. | Cumplimiento/regulatorio.
| T7 | Gestión conversacional | Capacidad para sostener turnos, aclarar dudas y ofrecer acciones siguientes basadas en la conversación previa. | % de turnos con oferta de acción relevante; tasa de preguntas aclaratorias pertinentes. | Reconoce historial (ej. “¿Quieres comparar...?”) sin inventar contexto. | UX.
| T8 | Eficiencia operativa | Costos y performance del modelo dentro del stack. | Latencia promedio por respuesta; tokens prompt/completion; costo estimado. | Menciona límites y evita respuestas excesivamente largas. | Ingeniería/FinOps.
| T9 | Seguridad y control | Manejo de datos sensibles, disclaimers y prevención de alucinaciones. | # de hallazgos de riesgo; % de respuestas con disclaimers cuando faltan datos. | Evita inventar proveedores inexistentes; indica “No registrado” cuando aplica. | Compliance.

## Dimensiones de negocio
| Código | Dimensión | Qué se evalúa | Indicadores | Impacto |
| --- | --- | --- | --- | --- |
| B1 | Claridad ejecutiva | Facilidad para que un gerente actúe con la respuesta. | % de respuestas con TL;DR o resumen estructurado; puntuación subjetiva (0-2). | Decisiones rápidas.
| B2 | Enfoque en KPI relevantes | Resaltar métricas pedidas (gasto trimestral, precio/kg, ingresos anuales). | Cobertura de KPI solicitados / KPI esperados. | Medición precisa.
| B3 | Insights accionables | Recomendaciones o próximos pasos concretos basados en datos. | % de respuestas que sugieren acción alineada al dato. | Estrategia y planificación.
| B4 | Contexto competitivo / comparativo | Capacidad para ofrecer comparativos (trimestres, proveedores, cultivos). | Nº de comparaciones relevantes por respuesta. | Planeación financiera.
| B5 | Gestión del riesgo | Identificación de vacíos (“No registrado”) y advertencias. | % de respuestas que advierten cuando falta data. | Riesgo operacional.
| B6 | Personalización y tono | Adecuación al rol del usuario (productor agrícola) y lenguaje en español neutro. | Evaluación cualitativa (0-2) + detección automática de idioma. | Experiencia cliente.
| B7 | Consistencia multi-turno | Mantener narrativa coherente a lo largo de la sesión. | % de turnos sin contradicción respecto a respuestas previas. | Confianza.
| B8 | Valor incremental | ¿El modelo añade hallazgos extra útiles (ej. estacionalidad) sin alucinar? | Conteo de insights adicionales validados. | Diferenciación del producto.

## Plantilla cruzada por pregunta
| Pregunta ID | Enunciado | Respuesta objetivo (resumen) | Dimensiones críticas (códigos) | Notas para evaluar |
| --- | --- | --- | --- | --- |
| expenses-fertilizers | ¿Cuánto he gastado en fertilizantes este trimestre? | COP 6.100.000 (2025 Q4). | T1, T2, T4, B1 | Validar cifra exacta, trimestre correcto, referencia `gastos_trimestrales.csv`.
| providers-seed-prices | ¿Qué proveedor ofrece mejores precios por kilo de semilla? | Proveeduría El Campesino, Semilla Caturra, 8.000 COP/kg. | T1, T2, T6, B2, B4 | Verificar criterio de “mejor precio” y mención del archivo `proveedores.csv`.
| sales-coffee-trends | ¿Cómo han variado mis ventas de café en los últimos 3 años? | Serie anual 2023-2025 con cantidades e ingresos crecientes. | T1, T2, T3, T5, B1, B3 | Exigir resumen anual y mención de tendencias/estacionalidad basada en `ventas_cafe_2023_2025.csv`.
| expenses-pesticides | ¿Cuál ha sido mi inversión total en pesticidas durante el último año? | “No registrado” según `gastos_trimestrales.csv`. | T2, T3, T9, B5 | Penalizar inventos; debe declarar falta de datos claramente.
| providers-equipment-comparison | ¿Qué proveedores tienen mejores condiciones de pago para maquinaria agrícola? | “No registrado” (sin datos en `proveedores.csv`). | T1, T3, T9, B5 | Se espera reconocimiento explícito de ausencia de información.
| sales-product-performance | ¿Qué cultivo generó mayor rentabilidad en los últimos dos trimestres? | Café. | T1, T2, B2, B3 | Necesita justificar con comparación contra otros cultivos en la fuente correspondiente.

## Procedimiento sugerido
1. Seleccionar modelo y pregunta, revisar `messages` y `sources` asociados.
2. Comparar contenido contra `RespuestasCorrectas.txt` y contra los CSV originales si es necesario.
3. Asignar puntaje 0-2 por cada dimensión aplicada; documentar métricas numéricas (latencia, tokens) en una hoja aparte.
4. Registrar hallazgos cualitativos (alucinaciones, falta de empatía, riesgos) en la columna “Notas”.
5. Repetir para los tres modelos y consolidar en un dashboard que permita comparar promedios por dimensión y por pregunta.
