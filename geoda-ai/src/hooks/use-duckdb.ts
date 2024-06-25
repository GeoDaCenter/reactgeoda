import {useCallback} from 'react';
import {tableFromArrays} from 'apache-arrow';
import * as duckdb from '@duckdb/duckdb-wasm';
// @ts-expect-error
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
// @ts-expect-error
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import {RawFileDataProps} from '@/actions';

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

export function getDuckDB() {
  return db;
}

// initial the global duckdb instance, delay 100ms to avoid blocking loading default page
setTimeout(async () => {
  db = await initDuckDB();
}, 100);

// wait until the page is loaded
// window.onload = async () => {
//   db = await initDuckDB();
// };

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
      try {
        // connect to the database
        const conn = await db.connect();
        // Query
        const arrowResult = await conn.query(`SUMMARIZE "${tableName}"`);
        // Convert arrow table to json FIXME
        const result = arrowResult.toArray().map((row: any) => row.toJSON());
        // close the connection
        await conn.close();
        // convert array of objects to a string with format of csv table
        const csv = result.map((row: any) => Object.values(row).join(',')).join('\n');
        // prepend the header
        const header = Object.keys(result[0]).join(',');
        tableSummary = `${header}\n${csv}`;
        return tableSummary;
      } catch (error) {
        console.error(error);
        return 'Error: can not get summary of the table because table name is not found';
      }
    }
    return tableSummary;
  }
  return 'Error: can not get summary of the table because the duckdb is not working properly.';
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
    const result = arrowResult.toArray().map((row: any) => row.toArray()[0]);
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
  /**
   * Add a new column to the table with the column name and values.
   * Note: using a bulk appended table:
   * Using a temporary table to store the values and then update the main table
   */
  const addColumnWithValues = useCallback(
    async (tableName: string, columnName: string, columnValues: number[]) => {
      if (db) {
        try {
          const conn = await db.connect();
          // create a temporary arrow table with the column name and values
          const arrowTable = tableFromArrays({[columnName]: columnValues});
          // create a temporary duckdb table using the arrow table
          await conn.insertArrowTable(arrowTable, {name: `temp_${columnName}`});
          // add a new column from the temporary table to the main table
          await conn.query(
            `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" NUMERIC DEFAULT 0`
          );
          // update the new column with the values from the temporary table
          await conn.query(
            `UPDATE "${tableName}" SET "${columnName}" = (SELECT "${columnName}" FROM "temp_${columnName}")`
          );
          // drop the temporary table
          await conn.query(`DROP TABLE "temp_${columnName}"`);
          await conn.close();
        } catch (error) {
          console.error(error);
          throw new Error("Can't add a new column with values to the table, Error: " + error);
        }
      }
    },
    []
  );

  const addColumn = useCallback(async (sql: string) => {
    if (db) {
      try {
        // remove \n from sql
        const sqlString = sql.replace(/\n/g, '');

        const conn = await db.connect();
        await conn.query(sqlString);
        await conn.close();
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const queryValues = useCallback(async (queryString: string): Promise<unknown[]> => {
    if (!db) {
      throw new Error('DuckDB is not initialized');
    }
    try {
      // remove \n from sql
      const sqlString = queryString.replace(/\n/g, '');

      const conn = await db.connect();
      const arrowResult = await conn.query<{v: any}>(sqlString);
      const result = arrowResult.getChildAt(0)?.toArray();
      await conn.close();
      return result || [];
    } catch (error) {
      console.error(error);
      throw new Error('Error: can not query the values from the table. Details: ' + error);
    }
  }, []);

  const query = useCallback(async (tableName: string, queryString: string): Promise<number[]> => {
    if (!db) {
      throw new Error('DuckDB is not initialized');
    }
    // remove \n from queryString
    const query = queryString.replace(/\n/g, '').trim();
    const sql =
      query.length > 0
        ? `SELECT row_index AS selected_index, * FROM "${tableName}" WHERE ${query.trim()}`
        : `SELECT row_index AS selected_index, * FROM "${tableName}"`;

    try {
      // connect to the database
      const conn = await db.connect();
      // Query
      const arrowResult = await conn.query<{v: any}>(sql);
      // Convert arrow table to json
      // const result = arrowResult.toArray().map(row => row.toJSON());
      // get the row_index[] from the query result
      const selectedIndexes = arrowResult.getChildAt(0)?.toArray();
      // close the connection
      await conn.close();
      return selectedIndexes || [];
    } catch (error) {
      console.error(error);
      throw new Error('Error: can not query the values from the table. Details: ' + error);
    }
  }, []);

  const importArrowFile = useCallback(
    async ({fileName: tableName, arrowTable}: RawFileDataProps) => {
      if (db) {
        const conn = await db.connect();

        const arrowResult = await conn.query('select * from information_schema.tables');
        const allTables = arrowResult.toArray().map((row: any) => row.toJSON());

        // check if tableName is already in the database
        if (!allTables.some((table: any) => table.table_name === tableName)) {
          try {
            // file to ArrayBuffer
            // const buffer = await file.arrayBuffer();
            // create a arrow table from File object
            // const arrowTable = tableFromIPC(buffer);
            // create a table in the database from arrowTable
            await conn.insertArrowTable(arrowTable, {name: tableName});

            // add a new column to the table for the row index
            await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN row_index INTEGER DEFAULT 0`);
            // generate an ascending sequence starting from 1
            await conn.query('CREATE SEQUENCE serial');
            // Use nextval to update the row_index column
            await conn.query(`UPDATE "${tableName}" SET row_index = nextval('serial') - 1`);
          } catch (error) {
            console.error(error);
          }
        }
        // close the connection
        await conn.close();
      }
    },
    []
  );

  return {query, queryValues, addColumn, importArrowFile, addColumnWithValues};
}
