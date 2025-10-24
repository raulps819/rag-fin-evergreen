"""
Query expansion service port (interface).
"""
from abc import ABC, abstractmethod


class QueryExpansionServicePort(ABC):
    """
    Port for query expansion operations.
    Expands user queries with synonyms and related terms to improve semantic search.
    """

    @abstractmethod
    async def expand_query(self, query: str) -> str:
        """
        Expand a query with synonyms and related terms.

        Args:
            query: Original user query in Spanish

        Returns:
            Expanded query with additional terms for better semantic matching
        """
        pass
