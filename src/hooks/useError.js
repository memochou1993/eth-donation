import { useState } from 'react';

const useError = (value = '') => {
  const [error, setError] = useState(value);
  return [error, setError];
};

export default useError;
