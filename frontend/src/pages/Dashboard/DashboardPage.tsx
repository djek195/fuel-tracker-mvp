import { Container, Typography, Button, Stack } from "@mui/material";
import { useAuth } from "../../auth/hooks/useAuth";

export function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Stack spacing={2}>
                <Typography variant="h4">Dashboard</Typography>
                <Typography>
                    Hello, <b>{user?.displayName || user?.email}</b>
                </Typography>
                <Button variant="outlined" onClick={() => logout()}>
                    Logout
                </Button>
            </Stack>
        </Container>
    );
}