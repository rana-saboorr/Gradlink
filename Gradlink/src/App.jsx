import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import store from './store';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRouter />
            <Toaster position="bottom-right" />
          </BrowserRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
