import { useCallback, useEffect, useState } from "react";

export const useFetch = (fetcher) => {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  const refetch = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, error: null, loading: false });
    } catch (error) {
      setState({ data: null, error, loading: false });
    }
  }, [fetcher]);

  useEffect(() => {
    let active = true;

    fetcher()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState({ data: null, error, loading: false }));

    return () => {
      active = false;
    };
  }, [fetcher]);

  return { ...state, refetch };
};
