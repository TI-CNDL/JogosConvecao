import { useEffect, useMemo, useState } from "react";
import {
  createAdminRecord,
  deleteAdminRecord,
  getAdminRecords,
  updateAdminRecord,
  uploadImage,
  uploadImages,
} from "../../lib/appDatabase";
import "./adminHubV2.style.css";

const resourceOrder = [
  "players",
  "games",
  "words",
  "quizQuestions",
  "soletraRounds",
];

const resourceLabels = {
  players: "Usuários",
  games: "Jogos",
  words: "Palavras",
  quizQuestions: "Perguntas do Quiz",
  soletraRounds: "Frases / Soletra",
  playerGameScores: "Pontuações por jogo",
  scoreEvents: "Eventos de score",
  gameSettings: "Configurações",
};

const resourceSchemas = {
  players: {
    title: "Usuários",
    searchPlaceholder: "Nome, telefone ou pontos",
    fields: [
      { key: "name", label: "Nome", type: "text" },
      { key: "phone", label: "Telefone", type: "text", required: true },
      { key: "totalPoints", label: "Pontos", type: "number" },
    ],
    emptyDraft: { name: "", phone: "", totalPoints: 0 },
    renderColumns: (row) => [
      row.id,
      row.name ?? "-",
      row.phone ?? "-",
      row.totalPoints ?? 0,
      formatDate(row.createdAt),
    ],
  },
  games: {
    title: "Jogos",
    searchPlaceholder: "Código ou nome",
    fields: [
      { key: "code", label: "Código", type: "text", required: true },
      { key: "name", label: "Nome", type: "text", required: true },
    ],
    emptyDraft: { code: "", name: "" },
    renderColumns: (row) => [row.id, row.code ?? "-", row.name ?? "-"],
  },
  words: {
    title: "Palavras",
    searchPlaceholder: "Palavra",
    fields: [
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        source: "games",
      },
      { key: "word", label: "Palavra (Individual)", type: "text" },
      { key: "bulkWords", label: "Palavras em Massa (separadas por vírgula)", type: "textarea" },
      { key: "imageUrl", label: "Imagem", type: "image" },
    ],
    emptyDraft: { gameId: "", word: "", bulkWords: "", imageUrl: "" },
    renderColumns: (row) => [
      row.id,
      row.Game?.code ?? row.gameId ?? "-",
      row.word ?? "-",
      row.imageUrl ?? "-",
    ],
  },
  quizQuestions: {
    title: "Perguntas do Quiz",
    searchPlaceholder: "Pergunta, resposta ou opções",
    fields: [
      { key: "gameId", label: "Jogo", type: "select", source: "games", required: true },
      { key: "question", label: "Pergunta (Individual)", type: "text" },
      { key: "answer", label: "Resposta Certa", type: "text" },
      { key: "bulkQuestions", label: "Perguntas em Massa (Formato: Pergunta.Resposta.)", type: "textarea" },
    ],
    emptyDraft: { gameId: "", question: "", answer: "", bulkQuestions: "" },
    renderColumns: (row) => [row.id, row.question ?? row.prompt ?? "-", row.answer ?? "-"],
  },
  soletraRounds: {
    title: "Frases / Soletra",
    searchPlaceholder: "Palavra ou dica",
    fields: [
      { key: "gameId", label: "Jogo", type: "select", source: "games", required: true },
      { key: "word", label: "Palavra (Individual)", type: "text" },
      { key: "hint", label: "Frase / Dica", type: "text" },
      { key: "bulkRounds", label: "Rodadas em Massa (Formato: Palavra.Dica.)", type: "textarea" },
    ],
    emptyDraft: { gameId: "", word: "", hint: "", bulkRounds: "" },
    renderColumns: (row) => [row.id, row.word ?? "-", row.hint ?? "-"],
  },
  playerGameScores: {
    title: "Pontuações por jogo",
    searchPlaceholder: "Usuário, jogo ou pontos",
    fields: [
      {
        key: "playerId",
        label: "Usuário",
        type: "select",
        required: true,
        source: "players",
      },
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        required: true,
        source: "games",
      },
      { key: "points", label: "Pontos", type: "number" },
      { key: "lastPlayedAt", label: "Última partida", type: "datetime" },
    ],
    emptyDraft: { playerId: "", gameId: "", points: 0, lastPlayedAt: "" },
    renderColumns: (row) => [
      row.id,
      row.Player?.name ?? row.Player?.phone ?? row.playerId ?? "-",
      row.Game?.code ?? row.gameId ?? "-",
      row.points ?? 0,
      formatDate(row.lastPlayedAt),
    ],
  },
  scoreEvents: {
    title: "Eventos de score",
    searchPlaceholder: "Usuário, jogo, pontos ou meta",
    fields: [
      {
        key: "playerId",
        label: "Usuário",
        type: "select",
        required: true,
        source: "players",
      },
      { key: "gameId", label: "Jogo", type: "select", source: "games" },
      { key: "points", label: "Pontos", type: "number" },
      { key: "timeBonus", label: "Bônus", type: "number" },
      { key: "meta", label: "Meta", type: "json" },
    ],
    emptyDraft: {
      playerId: "",
      gameId: "",
      points: 0,
      timeBonus: 0,
      meta: "{}",
    },
    renderColumns: (row) => [
      row.id,
      row.Player?.name ?? row.Player?.phone ?? row.playerId ?? "-",
      row.Game?.code ?? row.gameId ?? "-",
      row.points ?? 0,
      row.timeBonus ?? 0,
      stringify(row.meta),
    ],
  },
  gameSettings: {
    title: "Configurações",
    searchPlaceholder: "Chave, valor ou jogo",
    fields: [
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        required: true,
        source: "games",
      },
      { key: "key", label: "Chave", type: "text", required: true },
      { key: "value", label: "Valor", type: "json" },
    ],
    emptyDraft: { gameId: "", key: "", value: "{}" },
    renderColumns: (row) => [
      row.id,
      row.Game?.code ?? row.gameId ?? "-",
      row.key ?? "-",
      stringify(row.value),
    ],
  },
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleString("pt-BR");
};

const stringify = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "[objeto]";
  }
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const parseNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const getDraftValue = (row, key) => {
  const value = row?.[key];
  if (value === null || value === undefined) return "";
  if (key === "lastPlayedAt" && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString().slice(0, 16);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const buildDraft = (schema, row) => {
  const draft = { ...schema.emptyDraft };
  if (!row) return draft;
  schema.fields.forEach((field) => {
    draft[field.key] = getDraftValue(row, field.key);
  });
  return draft;
};

const serializeDraft = (schema, draft) => {
  const payload = {};
  schema.fields.forEach((field) => {
    const value = draft[field.key];
    if (field.type === "number") {
      payload[field.key] = parseNumberOrNull(value);
      return;
    }
    if (field.type === "datetime") {
      payload[field.key] = value ? new Date(value).toISOString() : null;
      return;
    }
    if (field.type === "json") {
      payload[field.key] = value === "" ? null : value;
      return;
    }
    if (field.type === "select") {
      payload[field.key] = parseNumberOrNull(value);
      return;
    }
    payload[field.key] = value;
  });
  return payload;
};

const getSearchText = (row) =>
  [
    row.id,
    row.name,
    row.phone,
    row.code,
    row.word,
    row.question,
    row.answer,
    row.hint,
    row.key,
    row.points,
    row.timeBonus,
    row.totalPoints,
    row.metadata,
    row.meta,
    row.options,
    row.value,
    row.Game?.name,
    row.Game?.code,
    row.Player?.name,
    row.Player?.phone,
  ]
    .map(normalize)
    .join(" ");

const filterRows = (rows, filters) => {
  const search = normalize(filters.search);
  const gameId = normalize(filters.gameId);
  const playerId = normalize(filters.playerId);

  return rows.filter((row) => {
    const rowGameId = normalize(row.gameId ?? row.Game?.id ?? row.GameId);
    const rowPlayerId = normalize(
      row.playerId ?? row.Player?.id ?? row.PlayerId,
    );

    if (gameId && rowGameId !== gameId) return false;
    if (playerId && rowPlayerId !== playerId) return false;
    if (!search) return true;
    return getSearchText(row).includes(search);
  });
};

function AdminFormModal({
  open,
  title,
  resource,
  mode,
  draft,
  fields,
  sources,
  loading,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-head">
          <div>
            <p className="eyebrow">{mode === "create" ? "Criar" : "Editar"}</p>
            <h2>{title}</h2>
          </div>
          <button className="ghost" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <form className="admin-form" onSubmit={onSubmit}>
          {fields.map((field) => {
            // Ocultar campos select pré-preenchidos em modo criação
            if (
              mode === "create" &&
              field.type === "select" &&
              draft[field.key] &&
              draft[field.key] !== ""
            ) {
              return null;
            }

            if (field.key === "word" || field.key === "bulkWords") {
              const games = sources["games"] ?? [];
              const selectedGame = games.find(g => String(g.id) === String(draft.gameId));
              if (selectedGame?.code === "memory") return null;
            }

            if (field.type === "select") {
              const options = sources[field.source] ?? [];
              return (
                <label className="time-field" key={field.key}>
                  <span>{field.label}</span>
                  <select
                    value={draft[field.key] ?? ""}
                    onChange={(event) =>
                      onChange(field.key, event.target.value)
                    }
                    required={field.required}
                  >
                    <option value="">Selecione</option>
                    {options.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name ??
                          item.code ??
                          item.phone ??
                          item.word ??
                          item.question ??
                          `#${item.id}`}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (field.type === "json") {
              return (
                <label className="time-field" key={field.key}>
                  <span>{field.label}</span>
                  <textarea
                    rows={4}
                    value={draft[field.key] ?? ""}
                    onChange={(event) =>
                      onChange(field.key, event.target.value)
                    }
                    placeholder="{} ou []"
                  />
                </label>
              );
            }

            if (field.type === "datetime") {
              return (
                <label className="time-field" key={field.key}>
                  <span>{field.label}</span>
                  <input
                    type="datetime-local"
                    value={draft[field.key] ?? ""}
                    onChange={(event) =>
                      onChange(field.key, event.target.value)
                    }
                  />
                </label>
              );
            }

            if (field.type === "textarea") {
              return (
                <label className="time-field" key={field.key}>
                  <span>{field.label}</span>
                  <textarea
                    value={draft[field.key] ?? ""}
                    onChange={(event) => onChange(field.key, event.target.value)}
                    required={field.required}
                    style={{ minHeight: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '4px' }}
                  />
                </label>
              );
            }

            if (field.type === "image") {
              const games = sources["games"] ?? [];
              const selectedGame = games.find(g => String(g.id) === String(draft.gameId));

              // Somente mostra o campo de imagem para o Jogo da Memória
              if (resource === "words") {
                if (selectedGame?.code !== "memory") return null;
              }

              return (
                <label className="time-field" key={field.key}>
                  <span>{field.label}</span>
                  <div className="admin-image-upload">
                    {draft[field.key] && (
                      <div className="admin-preview-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {(Array.isArray(draft[field.key]) ? draft[field.key] : [draft[field.key]]).map((url, idx) => (
                          <img
                            key={idx}
                            src={url.startsWith('data:') || url.startsWith('http') ? url : `http://localhost:4000${url.startsWith('/') ? '' : '/'}${url}`}
                            alt="Preview"
                            className="admin-preview-img"
                            style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                          />
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple={mode === "create" && selectedGame?.code === "memory"}
                      onChange={async (event) => {
                        const files = Array.from(event.target.files);
                        if (files.length === 0) return;

                        const toBase64 = (file) => new Promise((resolve, reject) => {
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = () => resolve(reader.result);
                          reader.onerror = error => reject(error);
                        });

                        try {
                          const base64Results = await Promise.all(files.map(toBase64));
                          if (base64Results.length === 1) {
                            onChange(field.key, base64Results[0]);
                          } else {
                            onChange(field.key, base64Results);
                          }
                        } catch (err) {
                          alert("Erro ao processar imagens");
                        }
                      }}
                    />
                  </div>
                </label>
              );
            }

            return (
              <label className="time-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={draft[field.key] ?? ""}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  required={field.required}
                />
              </label>
            );
          })}

          <div className="admin-form-actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading
                ? "Salvando..."
                : mode === "create"
                  ? "Cadastrar"
                  : "Salvar alterações"}
            </button>
            <button className="ghost" type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResourceSection({
  resource,
  records,
  filters,
  selection,
  onToggleSelection,
  onSelectAllVisible,
  onClearSelection,
  onFilterChange,
  onCreate,
  onEdit,
  onDelete,
  onDeleteSelected,
}) {
  const schema = resourceSchemas[resource];
  const allRows = records?.[resource] ?? [];
  const visibleRows = filterRows(
    allRows,
    filters[resource] ?? { search: "", gameId: "", playerId: "" },
  );
  const selectedIds = selection[resource] ?? [];
  const visibleSelected = visibleRows.filter((row) =>
    selectedIds.includes(String(row.id)),
  );
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedIds.includes(String(row.id)));

  return (
    <section className="admin-section panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Banco de dados</p>
          <h2>{schema.title}</h2>
        </div>
        <div className="admin-section-actions">
          <span className="pill">{visibleRows.length} visíveis</span>
          <span className="pill">{selectedIds.length} selecionados</span>
          <button
            className="ghost"
            type="button"
            onClick={() => onSelectAllVisible(resource, visibleRows)}
          >
            {allVisibleSelected ? "Desmarcar visíveis" : "Selecionar visíveis"}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => {
              const codeMap = {
                quizQuestions: "quiz",
                soletraRounds: "soletra",
              };
              const gameCode = codeMap[resource];
              const game = gameCode
                ? (records.games ?? []).find((g) => g.code === gameCode)
                : null;
              onCreate(resource, game ? { gameId: game.id } : {});
            }}
          >
            Novo registro
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <label className="admin-filter admin-filter-wide">
          <span>Buscar</span>
          <input
            type="search"
            value={filters[resource]?.search ?? ""}
            placeholder={schema.searchPlaceholder}
            onChange={(event) =>
              onFilterChange(resource, "search", event.target.value)
            }
          />
        </label>
      </div>

      {selectedIds.length > 0 && (
        <div className="admin-selection-bar">
          <div className="admin-selection-summary">
            <span>{selectedIds.length} selecionado(s)</span>
            <div className="admin-selection-chips">
              {visibleSelected.slice(0, 6).map((row) => (
                <span className="admin-selection-chip" key={row.id}>
                  {row.name ??
                    row.code ??
                    row.word ??
                    row.question ??
                    row.prompt ??
                    row.phone ??
                    row.key ??
                    `#${row.id}`}
                </span>
              ))}
              {visibleSelected.length > 6 && (
                <span className="admin-selection-chip">
                  +{visibleSelected.length - 6}
                </span>
              )}
            </div>
          </div>
          <button
            className="ghost"
            type="button"
            onClick={() => onClearSelection(resource)}
          >
            Limpar seleção
          </button>
          <button
            className="ghost danger"
            type="button"
            onClick={() => onDeleteSelected(resource, selectedIds)}
          >
            Excluir selecionados
          </button>
        </div>
      )}

      {visibleRows.length === 0 ? (
        <p className="muted">Nenhum registro encontrado.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-select-head">Selecionar</th>
                {resource === "players" && (
                  <>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Pontos</th>
                    <th>Criado em</th>
                  </>
                )}
                {resource === "games" && (
                  <>
                    <th>Código</th>
                    <th>Nome</th>
                  </>
                )}
                {resource === "quizQuestions" && (
                  <>
                    <th>Pergunta</th>
                    <th>Resposta</th>
                  </>
                )}
                {resource === "soletraRounds" && (
                  <>
                    <th>Palavra</th>
                    <th>Dica</th>
                  </>
                )}
                <th className="admin-actions-head">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resource === "quizQuestions" && (
                console.log("DEBUG FRONTEND: Desenhando QuizQuestions:", visibleRows),
                visibleRows.length > 0 && console.log("DEBUG FRONTEND: Exemplo da primeira pergunta:", visibleRows[0])
              )}
          {visibleRows.map((row) => {
                const isSelected = selectedIds.includes(String(row.id));
                return (
                  <tr key={row.id} className={isSelected ? "is-selected" : ""}>
                    <td className="admin-select-cell">
                      <label className="admin-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="admin-select-checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelection(resource, row.id)}
                          aria-label={`Selecionar registro ${row.id}`}
                        />
                        <span
                          className="admin-checkbox-box"
                          aria-hidden="true"
                        />
                      </label>
                    </td>
                    {schema
                      .renderColumns(row)
                      .slice(1)
                      .map((value, index) => (
                        <td key={`${row.id}-${index}`}>{value}</td>
                      ))}
                    <td className="admin-actions-cell">
                      <div className="admin-row-actions">
                        <button
                          className="ghost"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(resource, row);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="ghost danger"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete(resource, row);
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function WordsByGameSection({
  records,
  selection,
  onToggleSelection,
  onSelectAllVisible,
  onClearSelection,
  onCreate,
  onEdit,
  onDelete,
  onDeleteSelected,
}) {
  const allWords = records?.words ?? [];
  const games = records?.games ?? [];
  const selectedIds = selection.words ?? [];

  // Agrupar palavras por gameId
  const wordsByGame = new Map();
  for (const word of allWords) {
    const rawGid = word.gameId ?? word.Game?.id ?? "sem-jogo";
    const gid = rawGid !== "sem-jogo" ? String(rawGid) : rawGid;
    if (!wordsByGame.has(gid)) wordsByGame.set(gid, []);
    wordsByGame.get(gid).push(word);
  }

  // Jogos que utilizam a tabela de palavras
  const gamesThatUseWords = ["memory", "wordsearch", "hangman", "labirinto"];

  // Garantir que os jogos que usam palavras apareçam, mesmo sem palavras cadastradas
  const sortedGames = [...games]
    .filter((g) => gamesThatUseWords.includes(g.code))
    .sort((a, b) =>
      (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase()),
    );

  return (
    <>
      {sortedGames.map((game) => {
        const gameId = String(game.id);
        const words = wordsByGame.get(gameId) ?? [];
        const groupLabel = game.name ?? game.code ?? `#${gameId}`;

        return (
          <WordsGameTable
            key={gameId}
            gameId={gameId}
            gameLabel={groupLabel}
            isMemoryGame={game.code === "memory"}
            words={words}
            selectedIds={selectedIds}
            onToggleSelection={onToggleSelection}
            onSelectAllVisible={onSelectAllVisible}
            onClearSelection={onClearSelection}
            onCreate={onCreate}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeleteSelected={onDeleteSelected}
          />
        );
      })}

      {sortedGames.length === 0 && (
        <section className="admin-section panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Palavras</p>
              <h2>Nenhum jogo cadastrado</h2>
            </div>
          </div>
          <p className="muted">
            Cadastre jogos primeiro para adicionar palavras.
          </p>
        </section>
      )}
    </>
  );
}

/**
 * Tabela independente de palavras para UM jogo.
 * Cada instância tem seu próprio estado de busca local.
 */
function WordsGameTable({
  gameId,
  gameLabel,
  isMemoryGame,
  words,
  selectedIds,
  onToggleSelection,
  onSelectAllVisible,
  onClearSelection,
  onCreate,
  onEdit,
  onDelete,
  onDeleteSelected,
}) {
  const [search, setSearch] = useState("");

  const searchLower = search.trim().toLowerCase();
  const visibleWords = searchLower
    ? words.filter((row) => {
        const text = [row.id, row.word, row.meta]
          .map((v) => String(v ?? "").toLowerCase())
          .join(" ");
        return text.includes(searchLower);
      })
    : words;

  const visibleSelected = visibleWords.filter((row) =>
    selectedIds.includes(String(row.id)),
  );
  const allVisibleSelected =
    visibleWords.length > 0 &&
    visibleWords.every((row) => selectedIds.includes(String(row.id)));

  const groupSelectedIds = words
    .filter((row) => selectedIds.includes(String(row.id)))
    .map((row) => String(row.id));

  return (
    <section className="admin-section panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Palavras</p>
          <h2>{gameLabel}</h2>
        </div>
        <div className="admin-section-actions">
          <span className="pill">{visibleWords.length} visíveis</span>
          <span className="pill">{groupSelectedIds.length} selecionados</span>
          <button
            className="ghost"
            type="button"
            onClick={() => onSelectAllVisible("words", visibleWords)}
          >
            {allVisibleSelected ? "Desmarcar visíveis" : "Selecionar visíveis"}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => onCreate("words", { gameId: Number(gameId) })}
          >
            Novo registro
          </button>
        </div>
      </div>

      <div className="admin-filters">
        <label className="admin-filter admin-filter-wide">
          <span>Buscar</span>
          <input
            type="search"
            value={search}
            placeholder="Palavra ou meta"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {groupSelectedIds.length > 0 && (
        <div className="admin-selection-bar">
          <div className="admin-selection-summary">
            <span>{groupSelectedIds.length} selecionado(s)</span>
            <div className="admin-selection-chips">
              {visibleSelected.slice(0, 6).map((row) => (
                <span className="admin-selection-chip" key={row.id}>
                  {row.word ?? `#${row.id}`}
                </span>
              ))}
              {visibleSelected.length > 6 && (
                <span className="admin-selection-chip">
                  +{visibleSelected.length - 6}
                </span>
              )}
            </div>
          </div>
          <button
            className="ghost"
            type="button"
            onClick={() => onClearSelection("words")}
          >
            Limpar seleção
          </button>
          <button
            className="ghost danger"
            type="button"
            onClick={() => onDeleteSelected("words", groupSelectedIds)}
          >
            Excluir selecionados
          </button>
        </div>
      )}

      {visibleWords.length === 0 ? (
        <p className="muted">Nenhum registro encontrado.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-select-head">Selecionar</th>
                <th>ID</th>
                {!isMemoryGame && <th>Palavra</th>}
                {isMemoryGame && <th>Imagem</th>}
                <th className="admin-actions-head">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visibleWords.map((row) => {
                const isSelected = selectedIds.includes(String(row.id));
                return (
                  <tr key={row.id} className={isSelected ? "is-selected" : ""}>
                    <td className="admin-select-cell">
                      <label className="admin-checkbox-wrap">
                        <input
                          type="checkbox"
                          className="admin-select-checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelection("words", row.id)}
                          aria-label={`Selecionar registro ${row.id}`}
                        />
                        <span
                          className="admin-checkbox-box"
                          aria-hidden="true"
                        />
                      </label>
                    </td>
                    <td>{row.id}</td>
                    {!isMemoryGame && <td>{row.word ?? "-"}</td>}
                    {isMemoryGame && (
                      <td>
                        {row.imageUrl ? (
                          <img
                            src={
                              (row.imageUrl?.startsWith("data:") || row.imageUrl?.startsWith("http"))
                                ? row.imageUrl
                                : row.imageUrl?.length > 100 
                                  ? `data:image/png;base64,${row.imageUrl}`
                                  : `http://localhost:4000${row.imageUrl?.startsWith("/") ? "" : "/"}${row.imageUrl}`
                            }
                            alt="preview"
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    <td className="admin-actions-cell">
                      <div className="admin-row-actions">
                        <button
                          className="ghost"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit("words", row);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="ghost danger"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onDelete("words", row);
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminHub({ onBackToMenu }) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [selection, setSelection] = useState({});
  const [modalState, setModalState] = useState({
    open: false,
    mode: "create",
    resource: null,
    rowId: null,
    draft: {},
  });
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRecords = async () => {
    // Só mostra loading na primeira carga; refreshes são silenciosos
    if (!records) setLoading(true);
    setError("");
    try {
      const data = await getAdminRecords();
      console.log("DEBUG FRONTEND: Dados recebidos do servidor:", data);
      setRecords(data);
    } catch (err) {

      setError("Não foi possível carregar os registros do banco.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (!records) return;

    setFilters((current) => {
      const next = { ...current };
      resourceOrder.forEach((resource) => {
        if (!next[resource])
          next[resource] = { search: "", gameId: "", playerId: "" };
      });
      return next;
    });
  }, [records]);

  useEffect(() => {
    if (!records) return;

    setSelection((current) => {
      const next = {};
      resourceOrder.forEach((resource) => {
        const validIds = new Set(
          (records[resource] ?? []).map((row) => String(row.id)),
        );
        next[resource] = (current[resource] ?? []).filter((id) =>
          validIds.has(id),
        );
      });
      return next;
    });
  }, [records]);

  const sources = useMemo(
    () => ({ games: records?.games ?? [], players: records?.players ?? [] }),
    [records],
  );

  const updateFilter = (resource, key, value) => {
    setFilters((current) => ({
      ...current,
      [resource]: {
        ...(current[resource] ?? { search: "", gameId: "", playerId: "" }),
        [key]: value,
      },
    }));
  };

  const toggleSelection = (resource, rowId) => {
    const id = String(rowId);
    setSelection((current) => {
      const currentRows = current[resource] ?? [];
      return {
        ...current,
        [resource]: currentRows.includes(id)
          ? currentRows.filter((value) => value !== id)
          : [...currentRows, id],
      };
    });
  };

  const selectAllVisible = (resource, rows) => {
    const visibleIds = rows.map((row) => String(row.id));
    setSelection((current) => {
      const currentRows = current[resource] ?? [];
      const allVisibleSelected =
        visibleIds.length > 0 &&
        visibleIds.every((id) => currentRows.includes(id));
      return {
        ...current,
        [resource]: allVisibleSelected
          ? currentRows.filter((id) => !visibleIds.includes(id))
          : Array.from(new Set([...currentRows, ...visibleIds])),
      };
    });
  };

  const clearSelection = (resource) => {
    setSelection((current) => ({ ...current, [resource]: [] }));
  };

  const openCreate = (resource, defaults = {}) => {
    const schema = resourceSchemas[resource];
    setModalError("");
    setModalState({
      open: true,
      mode: "create",
      resource,
      rowId: null,
      draft: { ...schema.emptyDraft, ...defaults },
    });
  };

  const openEdit = (resource, row) => {
    const schema = resourceSchemas[resource];
    setModalError("");
    setModalState({
      open: true,
      mode: "edit",
      resource,
      rowId: row.id,
      draft: buildDraft(schema, row),
    });
  };

  const closeModal = () => {
    setModalState((current) => ({ ...current, open: false }));
    setModalError("");
  };

  const updateDraft = (key, value) => {
    setModalState((current) => ({
      ...current,
      draft: { ...current.draft, [key]: value },
    }));
  };

  const submitModal = async (event) => {
    event.preventDefault();
    if (!modalState.resource) return;

    setSaving(true);
    setModalError("");
    try {
      const schema = resourceSchemas[modalState.resource];
      const payload = serializeDraft(schema, modalState.draft);

      const games = sources["games"] ?? [];
      const selectedGame = games.find(g => String(g.id) === String(modalState.draft.gameId));
      const isMemory = modalState.resource === "words" && selectedGame?.code === "memory";

      // Validação extra para o recurso de palavras
      if (modalState.resource === "words") {
        if (isMemory) {
          if (!payload.imageUrl || (Array.isArray(payload.imageUrl) && payload.imageUrl.length === 0)) {
            setModalError("Por favor, selecione ao menos uma imagem.");
            setSaving(false);
            return;
          }
          // Deixa vazio para o Jogo da Memória
          if (!payload.word) payload.word = "";
        } else if (!payload.word && !payload.bulkWords) {
          setModalError("Por favor, digite ao menos uma palavra.");
          setSaving(false);
          return;
        }
      }

      if (modalState.resource === "quizQuestions") {
        if (!payload.question && !payload.bulkQuestions) {
          setModalError("Por favor, digite ao menos uma pergunta.");
          setSaving(false);
          return;
        }
      }

      if (modalState.resource === "soletraRounds") {
        if (!payload.word && !payload.bulkRounds) {
          setModalError("Por favor, digite ao menos uma palavra.");
          setSaving(false);
          return;
        }
      }

      if (modalState.mode === "create") {
        if (modalState.resource === "words" && Array.isArray(payload.imageUrl)) {
          const bulkPayload = payload.imageUrl.map(url => ({ ...payload, imageUrl: url }));
          await createAdminRecord(modalState.resource, bulkPayload);
        } else {
          await createAdminRecord(modalState.resource, payload);
        }
      } else {
        await updateAdminRecord(modalState.resource, modalState.rowId, payload);
      }
      await loadRecords();
      closeModal();
    } catch (err) {

      setModalError("Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (resource, row) => {
    const confirmed = window.confirm(`Excluir o registro #${row.id}?`);
    if (!confirmed) return;

    try {
      await deleteAdminRecord(resource, row.id);
      await loadRecords();
    } catch (err) {

      setError("Não foi possível excluir o registro.");
    }
  };

  const removeSelectedRecords = async (resource, ids) => {
    if (!ids || ids.length === 0) return;
    const confirmed = window.confirm(
      `Excluir ${ids.length} registro(s) selecionado(s)?`,
    );
    if (!confirmed) return;

    try {
      for (const id of ids) {
        await deleteAdminRecord(resource, id);
      }
      clearSelection(resource);
      await loadRecords();
    } catch (err) {

      setError("Não foi possível excluir alguns registros.");
      await loadRecords();
    }
  };

  return (
    <section className="admin-hub">
      <header className="panel admin-hero">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Administração</p>
            <h2>Hub CRUD do Banco de Dados</h2>
          </div>
          <button className="ghost" type="button" onClick={onBackToMenu}>
            Voltar ao menu
          </button>
        </div>

        <div className="admin-summary">
          {resourceOrder.map((resource) => (
            <div className="admin-summary-card" key={resource}>
              <span>{resourceLabels[resource]}</span>
              <strong>{records?.counts?.[resource] ?? 0}</strong>
            </div>
          ))}
        </div>

        {loading && <p className="muted">Carregando registros...</p>}
        {error && <p className="admin-error">{error}</p>}
      </header>

      {records && (
        <div className="admin-sections">
          {resourceOrder.map((resource) =>
            resource === "words" ? (
              <WordsByGameSection
                key="words"
                records={records}
                selection={selection}
                onToggleSelection={toggleSelection}
                onSelectAllVisible={selectAllVisible}
                onClearSelection={clearSelection}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={removeRecord}
                onDeleteSelected={removeSelectedRecords}
              />
            ) : (
              <ResourceSection
                key={resource}
                resource={resource}
                records={records}
                filters={filters}
                selection={selection}
                onToggleSelection={toggleSelection}
                onSelectAllVisible={selectAllVisible}
                onClearSelection={clearSelection}
                onFilterChange={updateFilter}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={removeRecord}
                onDeleteSelected={removeSelectedRecords}
              />
            ),
          )}
        </div>
      )}

      <div className="panel admin-actions">
        <button className="primary" type="button" onClick={loadRecords}>
          Atualizar registros
        </button>
      </div>

      <AdminFormModal
        open={modalState.open}
        title={
          modalState.resource
            ? resourceSchemas[modalState.resource].title
            : "Registro"
        }
        resource={modalState.resource}
        mode={modalState.mode}
        draft={modalState.draft}
        fields={
          modalState.resource ? resourceSchemas[modalState.resource].fields : []
        }
        sources={sources}
        loading={saving}
        error={modalError}
        onClose={closeModal}
        onChange={updateDraft}
        onSubmit={submitModal}
      />
    </section>
  );
}
