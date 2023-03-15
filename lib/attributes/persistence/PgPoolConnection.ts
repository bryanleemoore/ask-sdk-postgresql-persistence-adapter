/*
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { PostgreSQLConnection } from "./PostgreSQLConnection";
import * as pg from 'pg';

/**
 * PostgreSQL Pool connection extending {@link PostgreSQLConnection}.
 */
export class PgPoolConnection extends PostgreSQLConnection {
    private pool: pg.Pool;
    constructor(config: pg.PoolConfig) {
        super();
        this.pool = new pg.Pool(config);
    }

    public async query(query: string, params?: any[]): Promise<pg.QueryResult<any>> {
        const connection = await this.pool.connect();
        const result = await this.pool.query(query, params);
        connection.release();
        return result;
    }

    public async end(): Promise<void> {
        return this.pool.end();
    }

    public async checkConnection(): Promise<void> {
        const connection = await this.pool.connect();
        connection.release();
    }
}