import {useEffect, useState} from 'react';
import {tableFromArrays} from 'apache-arrow';
import * as duckdb from '@duckdb/duckdb-wasm';
// @ts-expect-error
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm';
// @ts-expect-error
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm';
import {DatasetProps} from '@/reducers/file-reducer';

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

const useDuckDB = () => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);

  useEffect(() => {
    initDuckDB();
    // return () => db.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initDuckDB = async () => {
    if (db === null) {
      // call initDuckDB() in background after 2000 ms
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Select a bundle based on browser checks
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      // Instantiate the asynchronus version of DuckDB-Wasm
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const newDB = new duckdb.AsyncDuckDB(logger, worker);
      await newDB.instantiate(bundle.mainModule, bundle.pthreadWorker);
      setDb(newDB);
    }
  };

  const getDuckDB = () => db;

  const getTableSummary = async (tableName: string) => {
    if (db) {
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
        const tableSummary = `${header}\n${csv}`;
        return tableSummary;
      } catch (error) {
        throw new Error(`Error: can not get summary of the table: ${error}`);
      }
    }
    return '';
  };

  const getColumnData = async (tableName: string, columnName: string) => {
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
  };

  const addColumnWithValues = async ({
    tableName,
    columnName,
    columnType,
    columnValues
  }: {
    tableName: string;
    columnName: string;
    columnType: 'NUMERIC' | 'VARCHAR';
    columnValues: unknown[];
  }) => {
    if (db) {
      try {
        const conn = await db.connect();
        // create a temporary arrow table with the column name and values
        const arrowTable = tableFromArrays({[columnName]: columnValues});
        // create a temporary duckdb table using the arrow table
        await conn.insertArrowTable(arrowTable, {name: `temp_${columnName}`});
        try {
          // add a new column from the temporary table to the main table
          await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnType}`);
        } catch (error) {
          // do nothing if can't add a new column since it might already exist
        }
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
  };

  const addColumnBySQL = async (sql: string) => {
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
  };

  const queryValuesBySQL = async (queryString: string) => {
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
  };

  const importArrowFile = async ({fileName: tableName, arrowTable}: DatasetProps) => {
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
  };

  return {
    initDuckDB,
    getDuckDB,
    getTableSummary,
    getColumnData,
    addColumnWithValues,
    addColumnBySQL,
    queryValuesBySQL,
    importArrowFile
  };
};
