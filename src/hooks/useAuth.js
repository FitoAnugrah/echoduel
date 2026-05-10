import { useAuthContext } from '../context/AuthContext';

// Custom hook to expose auth state and actions.
const useAuth = () => {
    return useAuthContext();
};

export default useAuth;