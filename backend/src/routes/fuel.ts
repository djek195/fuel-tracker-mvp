import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';
import 'express-session';

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
    const idFromLegacy = req.session?.userId;
    const idFromUserObj = req.session?.user && (req.session.user as any).id;
    const userId = idFromLegacy || idFromUserObj;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    req.session!.userId = userId;
    next();
}

function validateCreate(body: any) {
    const errors: string[] = [];
    if (!body?.vehicleId) errors.push('vehicleId is required');
    if (body.volume == null || Number(body.volume) <= 0) errors.push('volume must be > 0');
    if (body.price_total != null && Number(body.price_total) < 0) errors.push('price_total must be >= 0');
    if (body.price_per_unit != null && Number(body.price_per_unit) < 0) errors.push('price_per_unit must be >= 0');
    if (body.missed_fillups != null && Number(body.missed_fillups) < 0) errors.push('missed_fillups must be >= 0');
    return errors;
}

function validateUpdate(body: any) {
    const errors: string[] = [];
    ['volume','price_total','price_per_unit','missed_fillups'].forEach((k) => {
        if (body[k] != null && Number(body[k]) < 0) errors.push(`${k} must be >= 0`);
    });
    return errors;
}

// Check that the vehicle belongs to the user
async function ensureOwnVehicle(userId: string, vehicleId: string) {
    const { rows } = await pool.query(`SELECT 1 FROM vehicles WHERE id=$1 AND user_id=$2`, [vehicleId, userId]);
    return rows.length > 0;
}

router.get('/', requireAuth, async (req, res, next) => {
    try {
        const userId = req.session.userId as string;
        const { vehicleId, limit = '50', offset = '0' } = req.query as any;

        const params: any[] = [userId];
        let where = 'user_id = $1';
        if (vehicleId) {
            params.push(vehicleId);
            where += ` AND vehicle_id = $${params.length}`;
        }

        params.push(Number(limit));
        params.push(Number(offset));

        const { rows } = await pool.query(
            `SELECT id, user_id AS "userId", vehicle_id AS "vehicleId", occurred_at AS "occurredAt",
              odometer::float8 AS "odometer", volume::float8 AS "volume",
              price_total::float8 AS "priceTotal", price_per_unit::float8 AS "pricePerUnit",
              is_full AS "isFull", missed_fillups AS "missedFillups", note,
              created_at AS "createdAt", updated_at AS "updatedAt"
         FROM fuel_entries
        WHERE ${where}
        ORDER BY occurred_at DESC, created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );
        res.json(rows);
    } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req, res, next) => {
    try {
        const userId = req.session.userId as string;
        const errors = validateCreate(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const { vehicleId, occurred_at, odometer, volume, price_total, price_per_unit, is_full, missed_fillups, note } = req.body;

        if (!(await ensureOwnVehicle(userId, vehicleId))) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        const { rows } = await pool.query(
            `INSERT INTO fuel_entries
       (user_id, vehicle_id, occurred_at, odometer, volume, price_total, price_per_unit, is_full, missed_fillups, note)
       VALUES ($1,$2,COALESCE($3, now()),$4,$5,$6,$7,COALESCE($8, TRUE),COALESCE($9,0),$10)
       RETURNING id, user_id AS "userId", vehicle_id AS "vehicleId", occurred_at AS "occurredAt",
                 odometer::float8 AS "odometer", volume::float8 AS "volume",
                 price_total::float8 AS "priceTotal", price_per_unit::float8 AS "pricePerUnit",
                 is_full AS "isFull", missed_fillups AS "missedFillups", note,
                 created_at AS "createdAt", updated_at AS "updatedAt"`,
            [
                userId,
                vehicleId,
                occurred_at ?? null,
                odometer ?? null,
                volume,
                price_total ?? null,
                price_per_unit ?? (price_total && volume ? Number(price_total) / Number(volume) : null),
                is_full ?? true,
                missed_fillups ?? 0,
                note ?? null,
            ]
        );
        res.status(201).json(rows[0]);
    } catch (e) { next(e); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const userId = req.session.userId as string;
        const errors = validateUpdate(req.body);
        if (errors.length) return res.status(400).json({ errors });

        // Check that the entry belongs to the user
        const { rows: exists } = await pool.query(
            `SELECT vehicle_id FROM fuel_entries WHERE id=$1 AND user_id=$2`,
            [req.params.id, userId]
        );
        if (!exists.length) return res.status(404).json({ message: 'Entry not found' });

        const updates: string[] = [];
        const values: any[] = [];
        const push = (col: string, val: any) => { updates.push(`${col}=$${updates.length + 1}`); values.push(val); };

        ['occurred_at','odometer','volume','price_total','price_per_unit','is_full','missed_fillups','note'].forEach((k) => {
            if (req.body[k] !== undefined) push(k, req.body[k]);
        });

        if (!updates.length) {
            const { rows } = await pool.query(
                `SELECT id, user_id AS "userId", vehicle_id AS "vehicleId", occurred_at AS "occurredAt",
                odometer::float8 AS "odometer", volume::float8 AS "volume",
                price_total::float8 AS "priceTotal", price_per_unit::float8 AS "pricePerUnit",
                is_full AS "isFull", missed_fillups AS "missedFillups", note,
                created_at AS "createdAt", updated_at AS "updatedAt"
           FROM fuel_entries WHERE id=$1 AND user_id=$2`,
                [req.params.id, userId]
            );
            return res.json(rows[0]);
        }

        values.push(userId, req.params.id);
        const { rows } = await pool.query(
            `UPDATE fuel_entries
          SET ${updates.join(', ')}, updated_at=now()
        WHERE user_id = $${values.length - 1} AND id = $${values.length}
        RETURNING id, user_id AS "userId", vehicle_id AS "vehicleId", occurred_at AS "occurredAt",
                  odometer::float8 AS "odometer", volume::float8 AS "volume",
                  price_total::float8 AS "priceTotal", price_per_unit::float8 AS "pricePerUnit",
                  is_full AS "isFull", missed_fillups AS "missedFillups", note,
                  created_at AS "createdAt", updated_at AS "updatedAt"`,
            values
        );

        if (!rows.length) return res.status(404).json({ message: 'Entry not found' });
        res.json(rows[0]);
    } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const userId = req.session.userId as string;
        const { rowCount } = await pool.query(`DELETE FROM fuel_entries WHERE id=$1 AND user_id=$2`, [req.params.id, userId]);
        if (!rowCount) return res.status(404).json({ message: 'Entry not found' });
        res.json({ ok: true });
    } catch (e) { next(e); }
});

export const fuelRouter = router;