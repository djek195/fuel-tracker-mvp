import { Container } from "@mui/material";

/**
 * Horizontally centers content, adds vertical padding.
 * Sets maxWidth="sm" to prevent forms from stretching full width.
 */
export function PageContainer({ children }: { children: React.ReactNode }) {
    return (
        <Container
            maxWidth="sm"
            sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
            }}
        >
            {children}
        </Container>
    );
}