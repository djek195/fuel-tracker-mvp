import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

type Props<T extends FieldValues> = TextFieldProps & {
    control: Control<T>;
    name: FieldPath<T>;
};

export function FormTextField<T extends FieldValues>({ control, name, ...rest }: Props<T>) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <TextField
                    {...field}
                    {...rest}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                />
            )}
        />
    );
}