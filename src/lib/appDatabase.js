const apiBaseUrl = import.meta.env.VITE_DB_API_URL || "http://localhost:4000";

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const createEmptyDatabase = () => ({
    player: { name: '', phone: '' },
    gameData: {
        memorySymbols: [],
        labirintoWords: [],
        soletraRoundData: { exemplos: [] },
        quizQuestions: [],
        hangmanWords: [],
        wordSearchWords: [],
    },
    leads: {},
    settings: {},
    session: { selectedGame: null, screen: 'menu' },
    ranking: [],
});

export const getSeedDatabase = () => createEmptyDatabase();

async function safeFetch(url, opts = {}) {
    try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        throw err;
    }
}

export async function getPlayer(phone) {
    const url = `${apiBaseUrl}/api/identify`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
    });
    if (!res.ok) throw new Error('Failed to identify player');
    return await res.json();
}

export async function registerPlayer(name, phone) {
    const url = `${apiBaseUrl}/api/register`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) throw new Error('Failed to register player');
    return await res.json();
}

export async function saveGameScore(scoreData) {
    // scoreData: { phone, gameCode, points, remainingSeconds, timedOut, meta }
    const url = `${apiBaseUrl}/api/scores`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`Failed to save score ${res.status} ${txt}`);
    }
    return await res.json();
}

export async function getRanking() {
    const url = `${apiBaseUrl}/api/ranking`;
    return await safeFetch(url);
}

export async function getGameContent(gameCode) {
    const url = `${apiBaseUrl}/api/gameContent/${encodeURIComponent(gameCode)}`;
    return await safeFetch(url);
}

export async function getAdminRecords() {
    const url = `${apiBaseUrl}/api/admin/records`;
    return await safeFetch(url);
}

export async function createAdminRecord(resource, payload) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}`;
    return await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export async function updateAdminRecord(resource, id, payload) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`;
    return await safeFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

export async function deleteAdminRecord(resource, id) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`;
    return await safeFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function uploadImage(file) {
    const url = `${apiBaseUrl}/api/admin/upload`;
    const formData = new FormData();
    formData.append('images', file);

    const res = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const result = await res.json();
    return Array.isArray(result) ? result[0] : result;
}

export async function uploadImages(files) {
    const url = `${apiBaseUrl}/api/admin/upload`;
    const formData = new FormData();
    for (const file of files) {
        formData.append('images', file);
    }

    const res = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload images');
    return await res.json();
}

// Compatibility helpers previously used by the app
export async function loadAppDatabase() {
    // Try a quick health check to determine if backend is reachable
    try {
        await safeFetch(`${apiBaseUrl}/api/health`);
        // Backend reachable; return an empty seed database but mark as remote
        return { database: getSeedDatabase(), isRemote: true };
    } catch (err) {
        return { database: getSeedDatabase(), isRemote: false };
    }
}

export async function saveAppDatabase(nextDatabase) {
    // Compatibility no-op: the source of truth is now the backend API endpoints.
    // Keep this export so existing callers do not break during transition.
    return isPlainObject(nextDatabase) ? nextDatabase : getSeedDatabase();
}

export async function deleteAppDatabase() {
    // For safety, backend doesn't currently expose a delete endpoint by default
    return getSeedDatabase();
}
