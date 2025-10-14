import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertBox } from "../../components/ui/AlertBox";
import { FormTextField } from "../../components/ui/FormTextField";
import { PasswordField } from "../../components/ui/PasswordField";
import { SubmitButton } from "../../components/ui/SubmitButton";
import { Stack } from "@mui/material";
import { useAuth } from "../../auth/hooks/useAuth";
import { signUpSchema } from "../../validation/authSchemas";
import { useNavigate } from "react-router-dom";

type FormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
    const { register: registerUser } = useAuth();
    const nav = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        setError,
    } = useForm<FormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { email: "", password: "", confirmPassword: "", displayName: "" },
        mode: "onTouched",
    });

    const onSubmit = async (values: FormValues) => {
        const res = await registerUser(values);
        if (!res.ok) {
            if (res.status === 409) {
                setError("email", { message: "Email already in use" });
            } else {
                setError("root", { message: res.message || "Registration failed" });
            }
            return;
        }
        nav("/", { replace: true });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
                <AlertBox message={errors.root?.message} />
                <FormTextField control={control} name="email" label="Email" autoComplete="email" />
                <PasswordField control={control} name="password" label="Password" autoComplete="new-password" />
                <PasswordField control={control} name="confirmPassword" label="Confirm Password" autoComplete="new-password" />
                <FormTextField control={control} name="displayName" label="Display Name (optional)" />
                <SubmitButton loading={isSubmitting}>Create account</SubmitButton>
            </Stack>
        </form>
    );
}