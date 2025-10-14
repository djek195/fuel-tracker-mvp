import { Box, Container, Paper, Stack, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SignUpForm } from "./SignUpForm";

export function SignUpPage() {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
                bgcolor: (t) => t.palette.background.default,
                px: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420, mx: "auto" }}>
                    <Stack spacing={2}>
                        <Typography variant="h4" textAlign="center">
                            Sign Up
                        </Typography>

                        <SignUpForm />

                        <Typography textAlign="center">
                            Already have an account?{" "}
                            <Link component={RouterLink} to="/signin">
                                Sign In
                            </Link>
                        </Typography>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}