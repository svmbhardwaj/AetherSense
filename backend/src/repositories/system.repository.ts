import { pool } from "../config/database";

export interface DataSourceRow {
  id: string;
  name: string;
  kind: string;
  updated_at: Date;
  status: string;
}

/** Connectivity metadata for connected observation feeds. Rows only exist
 * when a data source has actually been registered — none may be listed. */
export const systemRepository = {
  async listDataSources() {
    const { rows } = await pool.query<DataSourceRow>(
      `SELECT id, name, kind, updated_at, status FROM data_sources ORDER BY updated_at DESC LIMIT 100`,
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind,
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
      status: r.status,
    }));
  },
};
