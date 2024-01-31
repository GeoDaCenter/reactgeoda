import {useCallback} from 'react';

import {tableFromIPC, row as ArrowRow} from 'apache-arrow';
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

// store table name in global scope, so it can be reused
let tableName: string | null = null;

// store the table summary in global scope, so it can be reused
let tableSummary: string | null = null;

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

// initial the global duckdb instance, delay 500ms to avoid blocking loading default page
setTimeout(async () => {
  db = await initDuckDB();
}, 200);

/**
 * Get the summary of a table by passing the table name
 * @param tableName
 *  @returns {Promise<string>} summary of the table
 */
export async function getTableSummary(inputTableName?: string): Promise<string> {
  if (db) {
    if (!tableSummary) {
      if (!tableName && inputTableName) {
        tableName = inputTableName;
      }
      // connect to the database
      const conn = await db.connect();
      // Query
      const arrowResult = await conn.query(`SUMMARIZE "${tableName}"`);
      // Convert arrow table to json
      const result = arrowResult.toArray().map((row: ArrowRow) => row.toJSON());
      // close the connection
      await conn.close();
      // convert array of objects to a string with format of csv table
      const csv = result.map((row: any) => Object.values(row).join(',')).join('\n');
      // prepend the header
      const header = Object.keys(result[0]).join(',');
      tableSummary = `${header}\n${csv}`;
    }
    return tableSummary;
  }
  return '';
}

export function getTableNameSync(): string | null {
  return tableName;
}

/**
 * Get the data from column by passing the column name
 */
export async function getColumnData(columnName: string): Promise<number[]> {
  if (db) {
    // connect to the database
    const conn = await db.connect();
    // Query
    const arrowResult = await conn.query(`SELECT "${columnName}" FROM "${tableName}"`);
    // Convert arrow table to json
    const result = arrowResult.toArray().map((row: ArrowRow) => row.toArray()[0]);
    // close the connection
    await conn.close();
    return result;
  }
  return [];
}

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
      tableName = file.name;

      const arrowResult = await conn.query('select * from information_schema.tables');
      const allTables = arrowResult.toArray().map((row: any) => row.toJSON());

      // check if tableName is already in the database
      if (!allTables.some((table: any) => table.table_name === tableName)) {
        try {
          // file to ArrayBuffer
          const buffer = await file.arrayBuffer();
          // create a arrow table from File object
          const arrowTable = tableFromIPC(buffer);
          // create a table in the database from arrowTable
          await conn.insertArrowTable(arrowTable, {name: tableName});

          // add a new column to the table for the row index
          await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN row_index INTEGER DEFAULT 0`);
          // generate an ascending sequence starting from 1
          await conn.query('CREATE SEQUENCE serial');
          // Use nextval to update the row_index column
          await conn.query(`UPDATE "${tableName}" SET row_index = nextval('serial') - 1`);

          // test summary table
          const summary = await getTableSummary();
          console.log('summary', summary);
        } catch (error) {
          console.error(error);
        }
      }
      // close the connection
      await conn.close();
    }
  }, []);

  return {query, importArrowFile};
}
