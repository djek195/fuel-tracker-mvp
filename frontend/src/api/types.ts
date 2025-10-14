export type PublicUser = {
    id: string;
    email: string;
    displayName: string | null;
    currency: string | null;
    distanceUnit: string | null;
    volumeUnit: string | null;
    timeZone: string | null;
};

export type ApiErrorShape = {
    message?: string;
    errors?: { field?: string; message: string }[];
    detail?: string;
};

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; status: number; error: ApiErrorShape };