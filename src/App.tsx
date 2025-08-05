import { SidebarProvider } from './components/ui/sidebar';
import './App.css';
import Page from './app/dashboard/page';

function App() {
  return (
    <SidebarProvider>
   <Page/>
    </SidebarProvider>
  );
}

export default App;