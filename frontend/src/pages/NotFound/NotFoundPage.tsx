import { Container, Typography } from "@mui/material";

export function NotFoundPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 6 }}>
            <Typography variant="h4">404 — Not Found</Typography>
        </Container>
    );
}