// Fuel entries API e2e (Express + session + supertest + vitest, strict CSRF)

import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

type SuperAgent = ReturnType<typeof request.agent>;

let app: any;
let agent1: SuperAgent;
let agent2: SuperAgent;

// ---- helpers ---------------------------------------------------------------

async function getCsrf(a: SuperAgent): Promise<string> {
    const res = await a.get('/api/auth/csrf').expect(200);
    return res.body?.csrfToken ?? '';
}

async function postJson(a: SuperAgent, url: string, body: any, status: number) {
    const token = await getCsrf(a);
    const res = await a.post(url).set('x-csrf-token', token).send(body);
    if (res.status !== status) {
        // eslint-disable-next-line no-console
        console.error('POST', url, 'expected', status, 'got', res.status, 'body:', res.body);
    }
    expect(res.status).toBe(status);
    return res;
}

async function putJson(a: SuperAgent, url: string, body: any, status: number) {
    const token = await getCsrf(a);
    const res = await a.put(url).set('x-csrf-token', token).send(body);
    if (res.status !== status) {
        // eslint-disable-next-line no-console
        console.error('PUT', url, 'expected', status, 'got', res.status, 'body:', res.body);
    }
    expect(res.status).toBe(status);
    return res;
}

async function del(a: SuperAgent, url: string, status: number) {
    const token = await getCsrf(a);
    const res = await a.delete(url).set('x-csrf-token', token);
    if (res.status !== status) {
        // eslint-disable-next-line no-console
        console.error('DELETE', url, 'expected', status, 'got', res.status, 'body:', res.body);
    }
    expect(res.status).toBe(status);
    return res;
}

async function registerAndLogin(a: SuperAgent, tag: string) {
    const email = `fuel-e2e+${tag}+${Date.now()}@example.com`;
    const password = 'P@ssw0rd12345';

    await postJson(a, '/api/auth/register', {
        email,
        password,
        confirmPassword: password,
    }, 201);

    await postJson(a, '/api/auth/login', {
        email,
        password,
    }, 200);

    const me = await a.get('/api/auth/me').expect(200);
    expect(me.body).toHaveProperty('user');
    expect(me.body.user).toHaveProperty('id');
    return me.body.user.id as string;
}

// ---------------------------------------------------------------------------

describe('Fuel API', () => {
    let vehicleIdUser1: string;
    let entryIdUser1: string;

    beforeAll(async () => {
        app = await createApp();
        agent1 = request.agent(app);
        agent2 = request.agent(app);

        await registerAndLogin(agent1, 'u1');
        await registerAndLogin(agent2, 'u2');

        // створимо авто для user1 (воно буде власником записів заправок)
        const v = await postJson(agent1, '/api/vehicles', { name: 'FuelCar' }, 201);
        vehicleIdUser1 = v.body.id as string;
        expect(typeof vehicleIdUser1).toBe('string');
    });

    afterAll(async () => {
        // закриття ресурсів за потреби
    });

    it('GET /api/fuel -> returns empty list initially', async () => {
        const res = await agent1.get('/api/fuel').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length === 0 || res.body.every((x: any) => x.userId)).toBe(true);
    });

    it('POST /api/fuel with valid payload -> 201 returns created item', async () => {
        const res = await postJson(agent1, '/api/fuel', {
            vehicleId: vehicleIdUser1,
            volume: 40.5,
            price_total: 300.0,
            odometer: 12345.6,
            is_full: true,
            note: 'Initial fill-up',
        }, 201);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('vehicleId', vehicleIdUser1);
        expect(res.body).toHaveProperty('volume', 40.5);
        expect(res.body).toHaveProperty('priceTotal', 300.0);
        expect(res.body).toHaveProperty('isFull', true);
        entryIdUser1 = res.body.id as string;
    });

    it('GET /api/fuel -> now contains created item', async () => {
        const res = await agent1.get('/api/fuel').expect(200);
        const item = res.body.find((e: any) => e.id === entryIdUser1);
        expect(item).toBeTruthy();
        expect(item.vehicleId).toBe(vehicleIdUser1);
    });

    it('PUT /api/fuel/:id -> updates fields', async () => {
        const res = await putJson(agent1, `/api/fuel/${entryIdUser1}`, {
            note: 'Updated note',
            volume: 42.0,
        }, 200);
        expect(res.body).toHaveProperty('note', 'Updated note');
        expect(res.body).toHaveProperty('volume', 42.0);
    });

    it('POST /api/fuel invalid volume (<=0) -> 400', async () => {
        await postJson(agent1, '/api/fuel', {
            vehicleId: vehicleIdUser1,
            volume: 0,
        }, 400);
    });

    it('POST /api/fuel with foreign vehicleId -> 404', async () => {
        // user2 створює своє авто
        const v2 = await postJson(agent2, '/api/vehicles', { name: 'OtherCar' }, 201);
        const vehicleIdUser2 = v2.body.id as string;

        // user1 намагається створити заправку на авто user2 -> 404
        await postJson(agent1, '/api/fuel', {
            vehicleId: vehicleIdUser2,
            volume: 10,
        }, 404);
    });

    it('Another user cannot see or modify user1 entry -> 404s', async () => {
        // список user2 не має містити записів user1
        const list2 = await agent2.get('/api/fuel').expect(200);
        const exists = list2.body.some((e: any) => e.id === entryIdUser1);
        expect(exists).toBe(false);

        // update чужого запису
        await putJson(agent2, `/api/fuel/${entryIdUser1}`, { note: 'hacker' }, 404);

        // delete чужого запису
        await del(agent2, `/api/fuel/${entryIdUser1}`, 404);
    });

    it('DELETE /api/fuel/:id -> removes item', async () => {
        await del(agent1, `/api/fuel/${entryIdUser1}`, 200);

        const list = await agent1.get('/api/fuel').expect(200);
        const exists = list.body.some((e: any) => e.id === entryIdUser1);
        expect(exists).toBe(false);
    });
});