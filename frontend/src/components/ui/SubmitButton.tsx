import React from "react";
import Button from "@mui/material/Button";
import type {ButtonProps} from "@mui/material/Button";

type Props = ButtonProps & {
    loading?: boolean;
    children: React.ReactNode;
};

export function SubmitButton({loading, children, disabled, ...rest}: Props) {
    return (
        <Button
            type="submit"
            variant="contained"
            loading={loading}
            disabled={loading || disabled}
            fullWidth
            {...rest}
        >
            {children}
        </Button>
    );
}