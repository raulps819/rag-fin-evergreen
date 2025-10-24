"""
OpenAI query expansion service.
"""
from openai import AsyncOpenAI
import logging

from app.domain.ports.query_expansion_service import QueryExpansionServicePort
from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAIQueryExpansionService(QueryExpansionServicePort):
    """
    Service for expanding queries using OpenAI LLM.
    Adds synonyms, translations, and related terms to improve semantic search.
    """

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4o-mini"  # Fast and cost-effective for query expansion
        self._client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None

    def _get_client(self) -> AsyncOpenAI:
        """Get OpenAI client."""
        if not self._client:
            raise ValueError("OPENAI_API_KEY not configured in environment variables")
        return self._client

    async def expand_query(self, query: str) -> str:
        """
        Expand a query with synonyms and related terms.

        Args:
            query: Original user query in Spanish

        Returns:
            Expanded query with additional terms for better semantic matching
        """
        client = self._get_client()

        # System prompt for query expansion focused on financial/sales domain
        system_prompt = """Eres un experto en expandir consultas para búsqueda semántica en documentos financieros y de ventas.

Tu tarea: Expandir la consulta agregando términos relacionados, sinónimos y traducciones al inglés.

Contexto de dominio:
- Documentos de ventas, clientes, facturas, contratos, órdenes de compra
- Campos técnicos en inglés: sales, customer, totalAmount, date, revenue, invoice, purchaseOrder
- Consultas de usuarios en español

Reglas importantes:
1. Mantén la consulta original al inicio
2. Agrega 2-3 términos adicionales relevantes (español e inglés)
3. Incluye solo términos del dominio financiero/ventas
4. NO agregues explicaciones ni texto adicional
5. Formato: términos separados por comas

Ejemplos:
Input: "ventas de este mes"
Output: ventas de este mes, sales, facturación, revenue, mes actual, current month

Input: "clientes nuevos"
Output: clientes nuevos, customers, new clients, recientes

Input: "cuánto vendí últimamente"
Output: cuánto vendí últimamente, sales, revenue, recently, últimos días, total amount"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ]

        try:
            response = await client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_completion_tokens=150,
                temperature=0.3  # Low temperature for consistent, focused expansions
            )

            expanded = response.choices[0].message.content

            if not expanded:
                logger.warning(f"Empty expansion from LLM for query: '{query}', using original")
                return query

            expanded = expanded.strip()
            logger.info(f"🔍 Query expanded: '{query}' -> '{expanded}'")

            return expanded

        except Exception as e:
            logger.error(f"Error expanding query with LLM: {str(e)}", exc_info=True)
            # Fallback: return original query if expansion fails
            logger.warning(f"Using original query due to expansion error: '{query}'")
            return query

    async def close(self):
        """Close the OpenAI client and cleanup resources."""
        if self._client:
            try:
                await self._client.close()
            except AttributeError:
                pass  # Ignore httpx wrapper issues
            finally:
                self._client = None