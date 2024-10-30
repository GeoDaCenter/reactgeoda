import {tableFromArrays, Field as ArrowField} from 'apache-arrow';
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

export class DuckDB {
  // singleton pattern to create a DuckDB instance
  static instance: DuckDB;
  static getInstance() {
    if (!DuckDB.instance) {
      DuckDB.instance = new DuckDB();
    }
    return DuckDB.instance;
  }

  private db: duckdb.AsyncDuckDB | null = null;

  // load spatial extension, which takes about 5.8MB compressed size
  // we should take advantage of this extension to expose spatial operations to the frontend
  private async loadSpatial() {
    if (!this.db) {
      throw new Error('DuckDB is not initialized');
    }
    // load spatial extension with error handling
    const conn = await this.db.connect();
    try {
      await conn.query(`INSTALL spatial;`);
      await conn.query(`LOAD spatial;`);
    } catch (error) {
      console.error('Error installing spatial extension:', error);
      // Attempt to load if it's already installed
      try {
        await conn.query(`LOAD spatial;`);
      } catch (loadError) {
        console.error('Error loading spatial extension:', loadError);
        throw new Error('Failed to initialize spatial extension');
      }
    } finally {
      // test spatial extension
      const result = await conn.query(
        `SELECT st_distance('POINT(0 0)'::GEOMETRY, 'POINT(1 1)'::GEOMETRY);`
      );
      console.log(result.toArray());
      await conn.close();
    }
  }

  public async initDuckDB() {
    if (this.db === null) {
      // call initDuckDB() in background after 2000 ms
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Select a bundle based on browser checks
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      // Instantiate the asynchronus version of DuckDB-Wasm
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    }
  }

  public getDuckDB = () => this.db;

  public getTableSummary = async (tableName: string) => {
    if (this.db) {
      try {
        // connect to the database
        const conn = await this.db.connect();
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

  public getColumnData = async (tableName: string, columnName: string) => {
    if (this.db) {
      // connect to the database
      const conn = await this.db.connect();
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

  public addColumnWithValues = async ({
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
    if (this.db) {
      try {
        const conn = await this.db.connect();
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

  public addColumnBySQL = async (sql: string) => {
    if (this.db) {
      try {
        // remove \n from sql
        const sqlString = sql.replace(/\n/g, '');

        const conn = await this.db.connect();
        await conn.query(sqlString);
        await conn.close();
      } catch (error) {
        console.error(error);
      }
    }
  };

  public addColumn = async (sql: string) => {
    if (this.db) {
      try {
        // remove \n from sql
        const sqlString = sql.replace(/\n/g, '');

        const conn = await this.db.connect();
        await conn.query(sqlString);
        await conn.close();
      } catch (error) {
        console.error(error);
      }
    }
  };

  public query = async (tableName: string, queryString: string) => {
    if (!this.db) {
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
      const conn = await this.db.connect();
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
  };

  public queryValuesBySQL = async (queryString: string): Promise<unknown[]> => {
    if (!this.db) {
      throw new Error('DuckDB is not initialized');
    }
    try {
      // remove \n from sql
      const sqlString = queryString.replace(/\n/g, '');

      const conn = await this.db.connect();
      const arrowResult = await conn.query<{v: any}>(sqlString);
      const result = arrowResult.getChildAt(0)?.toArray();
      await conn.close();
      return result || [];
    } catch (error) {
      console.error(error);
      throw new Error('Error: can not query the values from the table. Details: ' + error);
    }
  };

  public importArrowFile = async ({fileName: tableName, arrowTable}: DatasetProps) => {
    if (this.db) {
      const conn = await this.db.connect();

      const arrowResult = await conn.query('select * from information_schema.tables');
      const allTables = arrowResult.toArray().map((row: any) => row.toJSON());

      // check if tableName is already in the database
      if (!allTables.some((table: any) => table.table_name === tableName)) {
        try {
          // The following code is to fix the issue that DuckDB doesn't support the geoarrow ARROW:extension
          // See: https://github.com/duckdb/duckdb/blob/7f34190f3f94fc1b1575af829a9a0ccead87dc99/src/function/table/arrow.cpp#L118
          // update arrowTable and change the fields in schema temporarily that if metadata has key 'ARROW:extension:name' and value starts with 'geoarrow'
          const geometryFields: string[] = [];
          let extensionName = '';
          arrowTable.schema.fields.forEach((field: ArrowField) => {
            if (
              field.metadata &&
              field.metadata.get('ARROW:extension:name') &&
              field.metadata.get('ARROW:extension:name')?.startsWith('geoarrow')
            ) {
              geometryFields.push(field.name);
              extensionName = field.metadata.get('ARROW:extension:name') || '';
              field.metadata.set('ARROW:extension:name', '');
            }
          });

          // insert the arrow table to the database
          await conn.insertArrowTable(arrowTable, {name: tableName});

          // restore arrowTable schema fields metadata
          arrowTable.schema.fields.forEach((field: ArrowField) => {
            if (field.metadata && field.metadata.get('ARROW:extension:name') === '') {
              field.metadata.set('ARROW:extension:name', extensionName);
            }
          });

          // add a new column to the table for the row index
          await conn.query(`ALTER TABLE "${tableName}" ADD COLUMN row_index INTEGER DEFAULT 0`);
          // drop the sequence if it exists
          await conn.query('DROP SEQUENCE IF EXISTS serial');
          // generate an ascending sequence starting from 1
          await conn.query('CREATE SEQUENCE serial');
          // Use nextval to update the row_index column
          await conn.query(`UPDATE "${tableName}" SET row_index = nextval('serial') - 1`);
        } catch (error) {
          console.error(error);
          throw new Error(
            'Error: can not import the arrow file to the database. Details: ' + error
          );
        }
      }
      // close the connection
      await conn.close();
    }
  };
}
