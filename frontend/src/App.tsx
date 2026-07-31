import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner'; // hoặc react-hot-toast

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;