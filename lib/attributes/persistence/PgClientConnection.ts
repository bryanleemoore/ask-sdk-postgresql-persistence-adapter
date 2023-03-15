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
 * PostgreSQL Client connection extending {@link PostgreSQLConnection}.
 */
export class PgClientConnection extends PostgreSQLConnection {
    private client: pg.Client;
    constructor(config: pg.ClientConfig) {
        super();
        this.client = new pg.Client(config);
    }

    public async query(query: string, params?: any[]): Promise<pg.QueryResult<any>> {
        return await this.client.query(query, params);
    }

    public async end(): Promise<void> {
        this.client.end();
    }

    public async checkConnection(): Promise<void> {
        this.client.connect();
    }
}