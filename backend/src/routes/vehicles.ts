import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        userId?: string;
        user?: { id: string; [k: string]: any };
    }
}

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
    const idFromLegacy = req.session?.userId;
    const idFromUserObj = req.session?.user && (req.session.user as any).id;
    const userId = idFromLegacy || idFromUserObj;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Normalize so that the rest of the code relies on session.userId
    req.session!.userId = userId;
    next();
}

const MIN_YEAR = 1886;
const MAX_YEAR = new Date().getFullYear();

function validateCreate(body: any) {
    const errors: string[] = [];
    if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
        errors.push('name is required');
    }
    if (body.year != null) {
        const n = Number(body.year);
        if (!Number.isInteger(n) || n < MIN_YEAR || n > MAX_YEAR) {
            errors.push(`year must be integer between ${MIN_YEAR} and ${MAX_YEAR}`);
        }
    }
    ['make', 'model', 'fuelType'].forEach((k) => {
        if (body[k] != null && typeof body[k] !== 'string') {
            errors.push(`${k} must be a string`);
        }
    });
    return errors;
}

function validateUpdate(body: any) {
    const errors: string[] = [];
    if (body.name != null && (typeof body.name !== 'string' || body.name.trim() === '')) {
        errors.push('name must be a non-empty string');
    }
    if (body.year != null) {
        const n = Number(body.year);
        if (!Number.isInteger(n) || n < MIN_YEAR || n > MAX_YEAR) {
            errors.push(`year must be integer between ${MIN_YEAR} and ${MAX_YEAR}`);
        }
    }
    ['make', 'model', 'fuelType'].forEach((k) => {
        if (body[k] != null && typeof body[k] !== 'string') {
            errors.push(`${k} must be a string`);
        }
    });
    return errors;
}

router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.session.userId as string;
        const { rows } = await pool.query(
            `SELECT id, user_id AS "userId", name, make, model, year, fuel_type AS "fuelType",
              created_at AS "createdAt", updated_at AS "updatedAt"
       FROM vehicles
       WHERE user_id = $1
       ORDER BY created_at DESC`,
            [userId],
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateCreate(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const { name, make, model, year, fuelType } = req.body;
        const userId = req.session.userId as string;

        // Duplicate name per user guard (case-insensitive)
        const { rows: dup } = await pool.query(
            `SELECT 1 FROM vehicles WHERE user_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
            [userId, name.trim()]
        );
        if (dup.length > 0) {
            return res.status(409).json({ message: 'Vehicle with this name already exists' });
        }

        const { rows } = await pool.query(
            `INSERT INTO vehicles (user_id, name, make, model, year, fuel_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id AS "userId", name, make, model, year, fuel_type AS "fuelType",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
            [
                userId,
                name.trim(),
                make?.trim() ?? null,
                model?.trim() ?? null,
                year ?? null,
                fuelType?.trim() ?? null,
            ],
        );
        res.status(201).json(rows[0]);
    } catch (err: any) {
        if (err?.code === '23505') {
            return res.status(409).json({ message: 'Vehicle with this name already exists' });
        }
        next(err);
    }
});

router.put('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validateUpdate(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const userId = req.session.userId as string;

        const { rows: existingRows } = await pool.query(
            `SELECT id FROM vehicles WHERE id = $1 AND user_id = $2`,
            [req.params.id, userId],
        );
        if (existingRows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const { name, make, model, year, fuelType } = req.body;
        // If renaming, ensure uniqueness per user (case-insensitive), excluding current vehicle
        if (name != null) {
            const { rows: dupName } = await pool.query(
                `SELECT 1 FROM vehicles WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id <> $3 LIMIT 1`,
                [userId, name.trim(), req.params.id]
            );
            if (dupName.length > 0) {
                return res.status(409).json({ message: 'Vehicle with this name already exists' });
            }
        }

        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        function pushField(column: string, value: any) {
            fields.push(`${column} = $${idx++}`);
            values.push(value);
        }

        if (name != null) pushField('name', name.trim());
        if (make != null) pushField('make', make.trim());
        if (model != null) pushField('model', model.trim());
        if (year != null) pushField('year', year);
        if (fuelType != null) pushField('fuel_type', fuelType.trim());

        if (fields.length === 0) {
            const { rows } = await pool.query(
                `SELECT id, user_id AS "userId", name, make, model, year, fuel_type AS "fuelType",
                     created_at AS "createdAt", updated_at AS "updatedAt"
                 FROM vehicles
                 WHERE id = $1 AND user_id = $2`,
                [req.params.id, userId],
            );
            return res.json(rows[0]);
        }

        values.push(userId);
        values.push(req.params.id);

        const { rows } = await pool.query(
            `UPDATE vehicles
             SET ${fields.join(', ')}, updated_at = now()
             WHERE user_id = $${idx++} AND id = $${idx++}
                 RETURNING id, user_id AS "userId", name, make, model, year, fuel_type AS "fuelType",
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
            values,
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(rows[0]);
    } catch (err: any) {
        if (err?.code === '23505') {
            return res.status(409).json({ message: 'Vehicle with this name already exists' });
        }
        next(err);
    }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.session.userId as string;
        const result = await pool.query(
            `DELETE FROM vehicles
       WHERE id = $1 AND user_id = $2`,
            [req.params.id, userId],
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

export const vehiclesRouter = router;