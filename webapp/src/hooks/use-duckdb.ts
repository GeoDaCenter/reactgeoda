import {useCallback} from 'react';

import * as arrow from 'apache-arrow';
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
    // Select a bundle based on browser checks
    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
    // Instantiate the asynchronus version of DuckDB-Wasm
    const worker = new Worker(bundle.mainWorker!);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    return db;
  }
  return null;
}

// initial the global duckdb instance
db = await initDuckDB();

/**
 * custom hook to use DuckDB
 *
 * @returns {query, importTable} functions to query and import data
 */
export function useDuckDB() {
  const query = useCallback(async (queryString: string): Promise<number[]> => {
    // trim queryString
    queryString = queryString.trim();
    // compare the first 6 letters in queryString with "SELECT"
    const select = queryString.substring(0, 6).toUpperCase();
    if (select !== 'SELECT') {
      throw new Error('Only SELECT queries are supported');
    }
    if (!db) {
      throw new Error('DuckDB is not initialized');
    }
    // replace first 6 letters "select" with "select row_index AS selected_index"
    queryString = `SELECT row_index AS selected_index, ${queryString.substring(6)}`;

    // connect to the database
    const conn = await db.connect();
    // Query
    const arrowResult = await conn.query<{v: any}>(queryString);
    // Convert arrow table to json
    // const result = arrowResult.toArray().map(row => row.toJSON());
    // get the row_index[] from the query result
    const selectedIndexes = arrowResult.getChildAt(0)?.toArray();
    // close the connection
    await conn.close();
    return selectedIndexes || [];
  }, []);

  const importArrowFile = useCallback(async (file: File) => {
    if (db) {
      const conn = await db.connect();
      const tableName = file.name;

      const arrowResult = await conn.query('select * from information_schema.tables');
      const allTables = arrowResult.toArray().map(row => row.toJSON());

      // check if tableName is already in the database
      if (!allTables.some((table: any) => table.table_name === tableName)) {
        // file to ArrayBuffer
        const buffer = await file.arrayBuffer();
        // create a arrow table from File object
        const arrowTable = arrow.tableFromIPC(buffer);
        // create a table in the database from arrowTable
        await conn.insertArrowTable(arrowTable, {name: tableName});

        // add a new column to the table for the row index
        await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN row_index INTEGER DEFAULT 0`);
        // generate an ascending sequence starting from 1
        await conn.query('CREATE SEQUENCE serial');
        // Use nextval to update the row_index column
        await conn.query(`UPDATE "${tableName}" SET row_index = nextval('serial') - 1`);
      }
      // close the connection
      await conn.close();
    }
  }, []);

  return {query, importArrowFile};
}
