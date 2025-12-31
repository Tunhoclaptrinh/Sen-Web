import { useEffect, useState } from 'react';

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export const useFetch = <T = any>(
    apiFunction: (params?: any) => Promise<T>,
    params: any = {}
): UseFetchResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await apiFunction(params);
                setData(result);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiFunction, JSON.stringify(params)]);

    return { data, loading, error };
};

export default useFetch;
