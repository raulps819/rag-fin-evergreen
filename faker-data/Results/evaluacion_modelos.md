# Evaluación comparativa de modelos RAG

## 1. Evaluación de cada modelo

**Leyenda:** ✓ = correcto, ✗ = error, ~ = parcial, Ø = sin respuesta.

### GPT 5
| Pregunta ID | Estado | Evidencia |
| --- | --- | --- |
| expenses-fertilizers | ✓ | Reporta COP 6.100.000 para 2025 Q4 y ofrece comparar con otros trimestres (`faker-data/Results/GPT 5.txt:18` vs referencia `faker-data/Results/RespuestasCorrectas.txt:2-6`). |
| providers-seed-prices | ✓ | Identifica a Proveeduría El Campesino con 8.000 COP/kg y aporta alternativas (`faker-data/Results/GPT 5.txt:117` vs `faker-data/Results/RespuestasCorrectas.txt:7-11`). |
| sales-coffee-trends | ✓ | Resume los ingresos 2023-2025 con las mismas cifras del ground truth y añade insights estacionales (`faker-data/Results/GPT 5.txt:174` vs `faker-data/Results/RespuestasCorrectas.txt:12-19`). |
| expenses-pesticides | Ø | El log se corta tras los sources de ventas sin incluir esta pregunta (`faker-data/Results/GPT 5.txt:319-337`). |
| providers-equipment-comparison | Ø | No hay turnos asociados en el archivo (`faker-data/Results/GPT 5.txt:319-337`). |
| sales-product-performance | Ø | No hay turnos asociados en el archivo (`faker-data/Results/GPT 5.txt:319-337`). |

- **Cobertura (T3)**: 3/6 preguntas respondidas; indica que el pipeline corta la sesión o no enruta los siguientes prompts.
- **Exactitud (T2)**: 100% en las respuestas entregadas, con alineación completa a la referencia.
- **Razonamiento y narrativa (T5, B3)**: alto; explica tendencias, menciona estacionalidad y ofrece acciones siguientes.
- **Riesgo principal**: ausencia de la mitad de las respuestas; negocio no recibe información sobre pesticidas, maquinaria ni rentabilidad, por lo que el modelo no puede considerarse completo.

### GPT 5 MINI
| Pregunta ID | Estado | Evidencia |
| --- | --- | --- |
| expenses-fertilizers | ✓ | Devuelve COP 6.100.000 para Q4 2025 (`faker-data/Results/GPT 5 MINI.txt:17`). |
| providers-seed-prices | ✓ | Selecciona a Proveeduría El Campesino y lista opciones ordenadas por precio (`faker-data/Results/GPT 5 MINI.txt:116`). |
| sales-coffee-trends | ✗ | Informa 2024 como 16.650 kg y 172.810.000 COP alegando falta de julio, cifra que no coincide con el total correcto de 189.450.000 COP (`faker-data/Results/GPT 5 MINI.txt:173` vs `faker-data/Results/RespuestasCorrectas.txt:12-19`). |
| expenses-pesticides | ✓ | Rechaza responder por ausencia de categoría “pesticidas” y solicita datos adicionales en lugar de inventar (`faker-data/Results/GPT 5 MINI.txt:433`). |
| providers-equipment-comparison | ✓ | Aclara que no hay datos y entrega criterios/metodología para comparar sin alucinar proveedores (`faker-data/Results/GPT 5 MINI.txt:532`). |
| sales-product-performance | ✗ | Asegura que no puede identificar el cultivo más rentable pese a que el set tiene un único cultivo reportado y la respuesta esperada es Café (`faker-data/Results/GPT 5 MINI.txt:546` vs `faker-data/Results/RespuestasCorrectas.txt:31-34`). |

- **Exactitud (T2)**: 4/6 respuestas alineadas; errores notables en ventas 2024 y en la identificación del cultivo líder.
- **Manejo de datos faltantes (T9, B5)**: sólido en pesticidas y maquinaria; rechaza inventar y entrega guías prácticas.
- **Razonamiento (T5)**: aporta cálculos intermedios (rentabilidad trimestral) aunque no aterriza la conclusión esperada.
- **Riesgos**: subestima ingresos 2024, lo que distorsiona KPI clave; además no responde la pregunta de rentabilidad por cultivo aun cuando la referencia es unívoca.

### GPT 5 NANO
| Pregunta ID | Estado | Evidencia |
| --- | --- | --- |
| expenses-fertilizers | ✓ | Responde COP 6.100.000 para Q4 2025 (`faker-data/Results/GPT 5 NANO.txt:18`). |
| providers-seed-prices | ✓ | Entrega ranking correcto por precio (`faker-data/Results/GPT 5 NANO.txt:117`). |
| sales-coffee-trends | ✗ | Replica las mismas cifras erróneas de 2024 que GPT 5 MINI (172.810.000 COP) (`faker-data/Results/GPT 5 NANO.txt:174` vs `faker-data/Results/RespuestasCorrectas.txt:12-19`). |
| expenses-pesticides | ✗ | Asume que “pesticidas” = “fertilizantes” y reporta un total anual inexistente de 22.050.000 COP (`faker-data/Results/GPT 5 NANO.txt:434` vs `faker-data/Results/RespuestasCorrectas.txt:21-25`). |
| providers-equipment-comparison | ✓ | Reconoce ausencia de datos y propone marco metodológico (`faker-data/Results/GPT 5 NANO.txt:533`). |
| sales-product-performance | ✗ | Declara que no puede identificar el cultivo más rentable cuando la referencia es Café (`faker-data/Results/GPT 5 NANO.txt:547` vs `faker-data/Results/RespuestasCorrectas.txt:31-34`). |

- **Exactitud (T2)**: 3/6; errores críticos en ventas, pesticidas y cultivo rentable.
- **Seguridad (T9)**: falla en pesticidas al reinterpretar categorías y producir un número inventado.
- **Experiencia (B1/B3)**: mantiene estructura y recomendaciones, pero el contenido incorrecto introduce riesgo operativo.
- **Riesgos**: mezcla categorías (pesticidas vs fertilizantes) y hereda el sesgo de que faltan datos mensuales, lo que sugiere issues en la capa de interpretación o en el prompt.

## 2. Comparativa entre modelos
| Métrica clave | GPT 5 | GPT 5 MINI | GPT 5 NANO |
| --- | --- | --- | --- |
| Cobertura preguntas (T3) | 3/6 respondidas; sesión truncada (`GPT 5.txt:319-337`). | 6/6 respondidas. | 6/6 respondidas. |
| Coincidencias con ground truth (T2) | 3/6 (50%). | 4/6 (67%). | 3/6 (50%). |
| Manejo de datos faltantes (T9, B5) | No evaluado (no llegó a las preguntas sin dato). | Rechaza pesticidas y maquinaria sin alucinar (`GPT 5 MINI.txt:433`, `GPT 5 MINI.txt:532`). | Correcto en maquinaria pero inventa total de pesticidas (`GPT 5 NANO.txt:434`). |
| Fortalezas distintivas | Máxima calidad factual y narrativa cuando responde; buenas ofertas de siguiente acción. | Cobertura completa y buena contención de riesgos, más guías accionables. | Respuestas breves y orientadas a acción con listados comparativos. |
| Riesgos principales | Falta la mitad de los outputs (no apto para producción). | KPI de ventas erróneo y ausencia de conclusión sobre cultivo rentable. | Hallucination en pesticidas y misma brecha de rentabilidad por cultivo. |

## 3. Análisis general
- **Calidad técnica desigual**: la capa de recuperación funciona (todos citan las fuentes correctas), pero el procesamiento posterior se rompe en dos frentes: sesiones incompletas (GPT 5) y cálculos agregados inconsistentes (GPT 5 MINI/NANO) frente a las cifras oficiales (`faker-data/Results/RespuestasCorrectas.txt:12-19`).
- **Gestión de datos faltantes**: GPT 5 MINI y NANO reconocen cuando no hay información sobre maquinaria, pero solo el MINI evita inventar cifras en pesticidas, lo que demuestra distintas políticas de seguridad (T9/B5).
- **Necesidad de reglas de negocio**: ninguno de los modelos “menores” logra responder qué cultivo es más rentable, aun cuando la respuesta esperada es constante (Café), lo que sugiere que se requiere una instrucción explícita para interpretar “sin desglose = único cultivo” o enriquecer el set con metadatos.
- **Implicaciones de negocio**: errores en ventas anuales o en gastos de pesticidas impactan directamente en reportes financieros y decisiones de compra, por lo que deben priorizarse validaciones automáticas contra los CSV originales antes de exponer la respuesta.

## 4. Conclusiones importantes
1. **GPT 5** ofrece la mejor precisión y narrativa, pero la sesión incompleta lo descarta hasta resolver el bug de orquestación que impide responder las últimas tres preguntas críticas.
2. **GPT 5 MINI** es el candidato más balanceado una vez se corrijan los cálculos de ventas 2024 y se defina una regla clara para identificar el cultivo más rentable con datos agregados.
3. **GPT 5 NANO** necesita controles adicionales: debe dejar de mapear “pesticidas” a “fertilizantes” y reforzar la lógica de verificación de cifras antes de emitir totales.
4. El stack requiere **checks automáticos de exactitud (T2)** y **validaciones de completitud (T3)** antes de entregar respuestas al cliente, ya que los sesgos actuales derivan en métricas financieras erróneas y recomendaciones potencialmente costosas.
