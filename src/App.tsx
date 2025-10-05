import { RouterProviderComponent } from '@/router';
import { AuthProvider } from '@/contexts/AuthContext';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <RouterProviderComponent />
      </div>
    </AuthProvider>
  );
}

export default App;