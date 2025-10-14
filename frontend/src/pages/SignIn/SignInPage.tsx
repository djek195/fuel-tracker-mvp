import { Box, Container, Paper, Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SignInForm } from "./SignInForm";

export function SignInPage() {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // screen height minus AppBar (56px mobile / 64px desktop)
                minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
                bgcolor: (t) => t.palette.background.default,
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420, mx: "auto" }}>
                    <Stack spacing={2}>
                        <Typography variant="h4" textAlign="center">
                            Sign In
                        </Typography>

                        <SignInForm />

                        <Typography textAlign="center">
                            Don’t have an account?{" "}
                            <Link component={RouterLink} to="/signup">
                                Sign Up
                            </Link>
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}