import React from 'react';
import { RouterProviderComponent } from '@/router';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  return (
    <div className="App">
      <RouterProviderComponent />
    </div>
  );
}

export default App;