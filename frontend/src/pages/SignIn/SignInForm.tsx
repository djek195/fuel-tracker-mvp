import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertBox } from "../../components/ui/AlertBox";
import { FormTextField } from "../../components/ui/FormTextField";
import { PasswordField } from "../../components/ui/PasswordField";
import { SubmitButton } from "../../components/ui/SubmitButton";
import { Stack } from "@mui/material";
import { useAuth } from "../../auth/hooks/useAuth";
import { signInSchema } from "../../validation/authSchemas";
import { useNavigate, useLocation } from "react-router-dom";

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
    const { login } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const from = (loc.state as any)?.from?.pathname || "/";

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
    });

    const onSubmit = async (values: FormValues) => {
        const res = await login(values);
        if (!res.ok) {
            setError("root", { message: res.message || "Login failed" });
            return;
        }
        nav(from, { replace: true });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                <AlertBox message={errors.root?.message} />
                <FormTextField control={control} name="email" label="Email" autoComplete="email" />
                <PasswordField control={control} name="password" label="Password" autoComplete="current-password" />
                <SubmitButton loading={isSubmitting}>Sign In</SubmitButton>
            </Stack>
        </form>
    );
}