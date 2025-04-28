// src/hooks/useDataFetcher.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para obtener datos usando un servicio de API con actualización periódica
 * @param {Function} fetchFunction - Función del servicio API que devuelve una promesa
 * @param {number} refreshInterval - Intervalo de actualización en milisegundos (por defecto 30 segundos)
 * @param {Array} dependencies - Dependencias adicionales para la función de obtención de datos
 */
const useDataFetcher = (fetchFunction, refreshInterval = 30000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Función para obtener datos
  const fetchData = useCallback(async () => {
    try {
      const responseData = await fetchFunction();
      setData(responseData);
      setLastUpdated(new Date());
      setLoading(false);
      setError(null);
      return responseData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar datos';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [fetchFunction, ...dependencies]);

  // Función para forzar una actualización manual
  const refreshData = useCallback(() => {
    setLoading(true);
    return fetchData();
  }, [fetchData]);

  // Efecto para cargar datos iniciales y configurar actualizaciones periódicas
  useEffect(() => {
    fetchData();

    // Configurar actualización periódica
    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refreshData, lastUpdated };
};

export default useDataFetcher;