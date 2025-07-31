// React import not needed in newer versions
import { AdvancedDemo } from './components/AdvancedDemo';
import { MonitorDemo } from './components/MonitorDemo';
import { TestingDemo } from './components/TestingDemo';

function App() {
  return (
    <div className="App">
      <AdvancedDemo />
      <MonitorDemo />
      <TestingDemo />
    </div>
  );
}

export default App; 