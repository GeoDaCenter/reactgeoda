import {useCallback} from 'react';

import {tableFromIPC, Int as ArrowInt} from 'apache-arrow';
import * as duckdb from '@duckdb/duckdb-wasm';
// @ts-expect-error
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
// @ts-expect-error
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: new URL(
      '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
      import.meta.url
    ).toString()
  },
  eh: {
    mainModule: duckdb_wasm_next,
    mainWorker: new URL(
      '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
      import.meta.url
    ).toString()
  }
};

// keep a global duckdb instance, so it willbe only instantiated once using init()
let db: duckdb.AsyncDuckDB | null = null;

/**
 * Initialize DuckDB
 */
export async function initDuckDB() {
  if (db === null) {
    // call initDuckDB() in background after 2000 ms
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.time('duckdb init');
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-Wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    console.timeEnd('duckdb init');
    return db;
  }
  return null;
}

db = await initDuckDB();

/**
 * custom hook to use DuckDB
 *
 * @returns {query, importTable} functions to query and import data
 */
export function useDuckDB() {
  const query = useCallback(async (queryString: string) => {
    if (db) {
      // Create a new connection
      const conn = await db.connect();

      // Query
      const arrowResult = await conn.query<{v: ArrowInt}>(`SELECT count(*) FROM "arrow_table"`);

      // Convert arrow table to json
      const result = arrowResult.toArray().map(row => row.toJSON());

      console.log(result);
      // Close the connection to release memory
      await conn.close();
      return result;
    }
  }, []);

  const importArrowFile = useCallback(async (file: File) => {
    if (db) {
      const c = await db.connect();
      const tableName = file.name;

      const tables = await c.getTableNames(`SELECT * FROM "${tableName}"`);

      // check if tableName is already in the database
      if (!tables.includes(tableName)) {
        // file to ArrayBuffer
        const buffer = await file.arrayBuffer();
        // create a arrow table from File object
        const arrowTable = tableFromIPC(buffer);
        await c.insertArrowTable(arrowTable, {name: tableName});
      }
    }
  }, []);

  return {query, importArrowFile};
}
