/**
 * GERENCIADOR DE COMUNICAÇÃO COM O BACKEND (appDatabase.js)
 * Contém todas as funções de integração com a API REST do servidor (Node/Express).
 * Gerencia a identificação, registro de jogadores, envio de pontuações, busca de rankings
 * e operações administrativas (CRUD e upload de imagens).
 */

// Define a URL base da API buscando da variável de ambiente do Vite ou usando o fallback local
const apiBaseUrl = import.meta.env.VITE_DB_API_URL || "http://localhost:4000";

/**
 * Verifica se um valor é um objeto literal (plain object), excluindo null e arrays.
 * @param {any} value - Valor a ser inspecionado.
 * @returns {boolean} True se for um objeto literal.
 */
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Cria a estrutura inicial vazia do estado global da aplicação (Seed Database).
 * @returns {Object} Estrutura padrão com jogador, dados de jogos, leads, configurações e ranking.
 */
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

/**
 * Exporta a função para obter o banco de dados inicial vazio.
 */
export const getSeedDatabase = () => createEmptyDatabase();

/**
 * Função utilitária interna para realizar requisições HTTP seguras com tratamento de erros.
 * @param {string} url - URL de destino.
 * @param {Object} opts - Opções do fetch (método, cabeçalhos, corpo).
 * @returns {Promise<any>} Resposta convertida em JSON.
 */
async function safeFetch(url, opts = {}) {
    try {
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        throw err;
    }
}

/**
 * Busca os dados de um jogador no backend utilizando o número de telefone.
 * @param {string} phone - Telefone do jogador (formato mascarado).
 * @returns {Promise<Object>} Dados do jogador encontrado.
 */
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

/**
 * Registra um novo jogador no banco de dados do backend.
 * @param {string} name - Nome completo do jogador.
 * @param {string} phone - Telefone do jogador.
 * @returns {Promise<Object>} Resposta da API confirmando o cadastro.
 */
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

/**
 * Envia a pontuação obtida em uma partida para ser salva no backend.
 * @param {Object} scoreData - Objeto contendo { phone, gameCode, points, remainingSeconds, timedOut, meta }.
 * @returns {Promise<Object>} Resposta da API contendo o top 10 atualizado.
 */
export async function saveGameScore(scoreData) {
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

/**
 * Busca o ranking geral ou top 10 diretamente do backend.
 * @returns {Promise<Array>} Lista de jogadores ordenados por pontuação.
 */
export async function getRanking() {
    const url = `${apiBaseUrl}/api/ranking`;
    return await safeFetch(url);
}

/**
 * Busca o conteúdo específico de um jogo (palavras, perguntas, rounds) cadastrado no backend.
 * @param {string} gameCode - Código identificador do jogo (ex: 'memory', 'quiz', 'labirinto').
 * @returns {Promise<Object>} Estrutura de dados do jogo.
 */
export async function getGameContent(gameCode) {
    const url = `${apiBaseUrl}/api/gameContent/${encodeURIComponent(gameCode)}`;
    return await safeFetch(url);
}

/**
 * Busca todos os registros administrativos cadastrados no backend (para o AdminHub).
 * @returns {Promise<Object>} Registros consolidados.
 */
export async function getAdminRecords() {
    const url = `${apiBaseUrl}/api/admin/records`;
    return await safeFetch(url);
}

/**
 * Cria um novo registro administrativo no backend (ex: nova palavra, nova pergunta).
 * @param {string} resource - Nome do recurso (ex: 'words', 'quiz').
 * @param {Object} payload - Dados do registro a ser criado.
 * @returns {Promise<Object>} Registro criado.
 */
export async function createAdminRecord(resource, payload) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}`;
    return await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

/**
 * Atualiza um registro administrativo existente no backend.
 * @param {string} resource - Nome do recurso.
 * @param {string|number} id - ID do registro.
 * @param {Object} payload - Novos dados.
 * @returns {Promise<Object>} Registro atualizado.
 */
export async function updateAdminRecord(resource, id, payload) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`;
    return await safeFetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

/**
 * Remove um registro administrativo do backend.
 * @param {string} resource - Nome do recurso.
 * @param {string|number} id - ID do registro.
 * @returns {Promise<Object>} Confirmação da exclusão.
 */
export async function deleteAdminRecord(resource, id) {
    const url = `${apiBaseUrl}/api/admin/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`;
    return await safeFetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Realiza o upload de uma única imagem para o servidor.
 * @param {File} file - Arquivo de imagem capturado pelo input.
 * @returns {Promise<Object>} Metadados da imagem enviada (URL/caminho).
 */
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

/**
 * Realiza o upload de múltiplas imagens simultaneamente para o servidor.
 * @param {FileList|Array<File>} files - Lista de arquivos de imagem.
 * @returns {Promise<Array>} Lista com os metadados das imagens enviadas.
 */
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

/**
 * Verifica a disponibilidade do backend (Health Check) e inicializa o estado de conexão.
 * @returns {Promise<Object>} Objeto indicando se o modo remoto está ativo ({ database, isRemote }).
 */
export async function loadAppDatabase() {
    try {
        await safeFetch(`${apiBaseUrl}/api/health`);
        // Backend acessível; retorna o banco inicial e sinaliza que o modo remoto está ativo
        return { database: getSeedDatabase(), isRemote: true };
    } catch (err) {
        // Fallback caso o servidor esteja offline
        return { database: getSeedDatabase(), isRemote: false };
    }
}

/**
 * Função de compatibilidade mantida para evitar quebras em chamadas antigas.
 * No novo modelo arquitetural, a persistência é feita pontualmente nas rotas da API.
 * @param {Object} nextDatabase - Estado do banco.
 * @returns {Promise<Object>} O próprio banco ou a estrutura vazia.
 */
export async function saveAppDatabase(nextDatabase) {
    return isPlainObject(nextDatabase) ? nextDatabase : getSeedDatabase();
}

/**
 * Função de compatibilidade para deleção do banco.
 * Por segurança, o backend não expõe uma rota de exclusão total.
 * @returns {Promise<Object>} Estrutura de banco vazia.
 */
export async function deleteAppDatabase() {
    return getSeedDatabase();
}
