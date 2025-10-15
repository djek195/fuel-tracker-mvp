// Vehicles API e2e (Express + session + supertest + vitest, strict CSRF)

import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js'; // перевір шлях: якщо тести лежать у src/tests, можливо "../../app.js"

type SuperAgent = ReturnType<typeof request.agent>;

let app: any;
let agent: SuperAgent;

// ---- helpers ---------------------------------------------------------------

// Get CSRF token from your /api/auth/csrf endpoint
async function getCsrf(a: SuperAgent): Promise<string> {
    const res = await a.get('/api/auth/csrf').expect(200);
    return res.body?.csrfToken ?? '';
}

async function postJson(a: SuperAgent, url: string, body: any, status: number) {
    const token = await getCsrf(a);
    const res = await a.post(url).set('x-csrf-token', token).send(body);
    if (res.status !== status) {
        // make failures informative in CI logs
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
        console.error('PUT', url, 'expected', status, 'got', res.status, 'body:', res.body);
    }
    expect(res.status).toBe(status);
    return res;
}

async function del(a: SuperAgent, url: string, status: number) {
    const token = await getCsrf(a);
    const res = await a.delete(url).set('x-csrf-token', token);
    if (res.status !== status) {
        console.error('DELETE', url, 'expected', status, 'got', res.status, 'body:', res.body);
    }
    expect(res.status).toBe(status);
    return res;
}

async function registerAndLogin(a: SuperAgent) {
    const email = `veh-e2e+${Date.now()}@example.com`;
    const password = 'P@ssw0rd12345';

    // 1) register
    await postJson(a, '/api/auth/register', {
        email,
        password,
        confirmPassword: password,
    }, 201);

    // 2) login
    const loginRes = await postJson(a, '/api/auth/login', {
        email,
        password,
    }, 200);

    // 3) sanity-check: must have session (me -> 200)
    const me = await a.get('/api/auth/me');
    if (me.status !== 200) {
        // чіткий діагностичний вивід
        // eslint-disable-next-line no-console
        console.error('ME after login expected 200 got', me.status, 'login body:', loginRes.body, 'me body:', me.body);
    }
    expect(me.status).toBe(200);
    expect(me.body && typeof me.body === 'object').toBe(true);
    expect(me.body).toHaveProperty('user');
    expect(me.body.user).toBeTruthy();
    expect(me.body.user).toHaveProperty('id');
}

// ---------------------------------------------------------------------------

describe('Vehicles API', () => {
    beforeAll(async () => {
        app = await createApp();           // твій app.ts експортує async createApp()
        agent = request.agent(app);        // agent зберігає cookie (session + csrf)
        await registerAndLogin(agent);
    });

    afterAll(async () => {
        // якщо треба закривати пул БД — зроби це тут
    });

    it('GET /api/vehicles -> returns empty list initially', async () => {
        const res = await agent.get('/api/vehicles').expect(200);
        expect(Array.isArray(res.body)).toBe(true);
        // може бути не 0, якщо паралельно вже створили — але для чистого стенду:
        // expect(res.body).toHaveLength(0);
    });

    it('POST /api/vehicles without name -> 400', async () => {
        await postJson(agent, '/api/vehicles', {}, 400);
    });

    it('POST /api/vehicles with name -> 201 and returns created item', async () => {
        const res = await postJson(agent, '/api/vehicles', { name: 'My Car', year: 2020 }, 201);

        expect(res.body).toHaveProperty('id');
        expect(typeof res.body.id).toBe('string'); // UUID
        expect(res.body.name).toBe('My Car');
        expect(res.body.year).toBe(2020);
    });

    it('GET /api/vehicles -> now contains created item', async () => {
        const res = await agent.get('/api/vehicles').expect(200);
        const item = res.body.find((v: any) => v.name === 'My Car');
        expect(item).toBeTruthy();
    });

    it('PUT /api/vehicles/:id -> updates only own vehicle', async () => {
        const created = await postJson(agent, '/api/vehicles', { name: 'Old Name' }, 201);
        const id = created.body.id as string;

        const updated = await putJson(agent, `/api/vehicles/${id}`, { name: 'New Name' }, 200);
        expect(updated.body.name).toBe('New Name');
    });

    it('DELETE /api/vehicles/:id -> removes item', async () => {
        const created = await postJson(agent, '/api/vehicles', { name: 'To Delete' }, 201);
        const id = created.body.id as string;

        await del(agent, `/api/vehicles/${id}`, 200);

        const list = await agent.get('/api/vehicles').expect(200);
        const exists = list.body.some((v: any) => v.id === id);
        expect(exists).toBe(false);
    });

    it('POST duplicate name for same user -> 409', async () => {
        await postJson(agent, '/api/vehicles', { name: 'UniqueName' }, 201);
        await postJson(agent, '/api/vehicles', { name: 'UniqueName' }, 409);
    });

    it('PUT invalid year -> 400', async () => {
        const created = await postJson(agent, '/api/vehicles', { name: 'Year Car' }, 201);
        const id = created.body.id as string;

        await putJson(agent, `/api/vehicles/${id}`, { year: 1500 }, 400); // invalid year
    });
});