import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { DemoModeProvider } from "./context/DemoModeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import App from "./App";
import "./index.css";

// Configure React Query with better error handling
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 30000, // 30 seconds
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")).render(
    <ErrorBoundary
        message="The application encountered a critical error. Please refresh the page."
        onError={(error, errorInfo) => {
            // Log critical errors - could send to monitoring service
            console.error("Critical application error:", error, errorInfo);
        }}
    >
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <DemoModeProvider>
                        <AuthProvider>
                            <ToastProvider>
                                <App />
                            </ToastProvider>
                        </AuthProvider>
                    </DemoModeProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </ErrorBoundary>,
);
