// If this file is only used in client components, keep useLoading. Otherwise, remove it.
import { useLoading } from '@/lib/context/loading-context';

interface ApiOptions {
  showLoader?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

export function useApi() {
  const { showLoader, hideLoader } = useLoading();

  const fetchWithLoader = async (
    url: string,
    options: RequestInit = {},
    apiOptions: ApiOptions = {}
  ): Promise<unknown> => {
    const { showLoader: shouldShowLoader = true, onSuccess, onError } = apiOptions;

    try {
      if (shouldShowLoader) {
        showLoader();
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      if (shouldShowLoader) {
        hideLoader();
      }
    }
  };

  return { fetchWithLoader };
} 