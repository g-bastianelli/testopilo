import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './styles.css';

// Import the generated route tree
import { RootRoute } from './routes/__root';
import { LmnpPageRoute } from './routes/SimulationPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new router instance
const routeTree = RootRoute.addChildren([LmnpPageRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  );
}
