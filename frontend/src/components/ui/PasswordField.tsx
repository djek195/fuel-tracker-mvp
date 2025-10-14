import {useState} from "react";
import {IconButton, InputAdornment} from "@mui/material";
import type {TextFieldProps} from "@mui/material/TextField";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {Controller} from "react-hook-form";
import type {Control, FieldValues, FieldPath} from "react-hook-form";
import TextField from "@mui/material/TextField";

type Props<T extends FieldValues> = TextFieldProps & {
    control: Control<T>;
    name: FieldPath<T>;
};

export function PasswordField<T extends FieldValues>({control, name, ...rest}: Props<T>) {
    const [show, setShow] = useState(false);
    const toggle = () => setShow((s) => !s);

    return (
        <Controller
            control={control}
            name={name}
            render={({field, fieldState}) => (
                <TextField
                    {...field}
                    {...rest}
                    type={show ? "text" : "password"}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={toggle} edge="end" aria-label="toggle password visibility">
                                    {show ? <VisibilityOff/> : <Visibility/>}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            )}
        />
    );
}