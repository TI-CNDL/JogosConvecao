import { useEffect, useMemo, useState } from "react";
import {
  createAdminRecord,
  deleteAdminRecord,
  getAdminRecords,
  updateAdminRecord,
} from "../../lib/appDatabase";
import "./adminHubV2.style.css";

const resourceOrder = [
  "players",
  "games",
  "words",
  "quizQuestions",
  "soletraRounds",
  "playerGameScores",
  "scoreEvents",
  "gameSettings",
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
      { key: "metadata", label: "Metadata", type: "json" },
    ],
    emptyDraft: { code: "", name: "", metadata: "{}" },
    renderColumns: (row) => [
      row.id,
      row.code ?? "-",
      row.name ?? "-",
      stringify(row.metadata),
    ],
  },
  words: {
    title: "Palavras",
    searchPlaceholder: "Palavra ou meta",
    fields: [
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        required: true,
        source: "games",
      },
      { key: "word", label: "Palavra", type: "text", required: true },
      { key: "meta", label: "Meta", type: "json" },
    ],
    emptyDraft: { gameId: "", word: "", meta: "{}" },
    renderColumns: (row) => [
      row.id,
      row.Game?.code ?? row.gameId ?? "-",
      row.word ?? "-",
      stringify(row.meta),
    ],
  },
  quizQuestions: {
    title: "Perguntas do Quiz",
    searchPlaceholder: "Pergunta, resposta ou opções",
    fields: [
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        required: true,
        source: "games",
      },
      { key: "question", label: "Pergunta", type: "text", required: true },
      {
        key: "options",
        label: "Opções (JSON array)",
        type: "json",
        required: true,
      },
      { key: "answer", label: "Resposta", type: "text", required: true },
    ],
    emptyDraft: { gameId: "", question: "", options: '[""]', answer: "" },
    renderColumns: (row) => [
      row.id,
      row.Game?.code ?? row.gameId ?? "-",
      row.question ?? "-",
      stringify(row.options),
      row.answer ?? "-",
    ],
  },
  soletraRounds: {
    title: "Frases / Soletra",
    searchPlaceholder: "Palavra ou dica",
    fields: [
      {
        key: "gameId",
        label: "Jogo",
        type: "select",
        required: true,
        source: "games",
      },
      { key: "word", label: "Palavra", type: "text", required: true },
      { key: "hint", label: "Frase / Dica", type: "text" },
    ],
    emptyDraft: { gameId: "", word: "", hint: "" },
    renderColumns: (row) => [
      row.id,
      row.Game?.code ?? row.gameId ?? "-",
      row.word ?? "-",
      row.hint ?? "-",
    ],
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
            onClick={() => onCreate(resource)}
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

        {(resource === "words" ||
          resource === "quizQuestions" ||
          resource === "soletraRounds" ||
          resource === "playerGameScores" ||
          resource === "scoreEvents" ||
          resource === "gameSettings") && (
          <label className="admin-filter">
            <span>Jogo</span>
            <select
              value={filters[resource]?.gameId ?? ""}
              onChange={(event) =>
                onFilterChange(resource, "gameId", event.target.value)
              }
            >
              <option value="">Todos</option>
              {(records.games ?? []).map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name ?? game.code ?? `#${game.id}`}
                </option>
              ))}
            </select>
          </label>
        )}

        {(resource === "playerGameScores" || resource === "scoreEvents") && (
          <label className="admin-filter">
            <span>Usuário</span>
            <select
              value={filters[resource]?.playerId ?? ""}
              onChange={(event) =>
                onFilterChange(resource, "playerId", event.target.value)
              }
            >
              <option value="">Todos</option>
              {(records.players ?? []).map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name ?? player.phone ?? `#${player.id}`}
                </option>
              ))}
            </select>
          </label>
        )}
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
                <th>ID</th>
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
                    <th>Metadata</th>
                  </>
                )}
                {resource === "words" && (
                  <>
                    <th>Jogo</th>
                    <th>Palavra</th>
                    <th>Meta</th>
                  </>
                )}
                {resource === "quizQuestions" && (
                  <>
                    <th>Jogo</th>
                    <th>Pergunta</th>
                    <th>Opções</th>
                    <th>Resposta</th>
                  </>
                )}
                {resource === "soletraRounds" && (
                  <>
                    <th>Jogo</th>
                    <th>Palavra</th>
                    <th>Dica</th>
                  </>
                )}
                {resource === "playerGameScores" && (
                  <>
                    <th>Usuário</th>
                    <th>Jogo</th>
                    <th>Pontos</th>
                    <th>Última partida</th>
                  </>
                )}
                {resource === "scoreEvents" && (
                  <>
                    <th>Usuário</th>
                    <th>Jogo</th>
                    <th>Pontos</th>
                    <th>Bônus</th>
                    <th>Meta</th>
                  </>
                )}
                {resource === "gameSettings" && (
                  <>
                    <th>Jogo</th>
                    <th>Chave</th>
                    <th>Valor</th>
                  </>
                )}
                <th className="admin-actions-head">Ações</th>
              </tr>
            </thead>
            <tbody>
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
                    <td>{row.id}</td>
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
    setLoading(true);
    setError("");
    try {
      const data = await getAdminRecords();
      setRecords(data);
    } catch (err) {
      console.error(err);
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

  const openCreate = (resource) => {
    const schema = resourceSchemas[resource];
    setModalError("");
    setModalState({
      open: true,
      mode: "create",
      resource,
      rowId: null,
      draft: { ...schema.emptyDraft },
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
      if (modalState.mode === "create") {
        await createAdminRecord(modalState.resource, payload);
      } else {
        await updateAdminRecord(modalState.resource, modalState.rowId, payload);
      }
      await loadRecords();
      closeModal();
    } catch (err) {
      console.error(err);
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
      console.error(err);
      setError("Não foi possível excluir o registro.");
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

      {records && !loading && (
        <div className="admin-sections">
          {resourceOrder.map((resource) => (
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
            />
          ))}
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
