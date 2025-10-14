import { ThemeProvider } from "./providers/ThemeProvider";
import { SnackbarProvider } from "./providers/SnackbarProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { AppRouter } from "./routes";

export default function App() {
    return (
        <ThemeProvider>
            <SnackbarProvider>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}