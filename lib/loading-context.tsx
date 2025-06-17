import React, { useState, createContext } from 'react';

const LoadingContext = createContext<{ loading: boolean; setLoading: (loading: boolean) => void }>({ loading: false, setLoading: () => {} });

const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export { LoadingContext, LoadingProvider }; 