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

import { createAskSdkError, PersistenceAdapter } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';
import { PartitionKeyGenerator, PartitionKeyGenerators } from './PartitionKeyGenerators';
import * as pg from 'pg';

export type PostgreSQLPersistenceAdapterParams = {
    tableName: string;
    partitionKeyName?: string;
    attributesName?: string;
    partitionKeyGenerator?: PartitionKeyGenerator;
    connection: PostgreSQLConnection;
};

/**
 * Abstract PostgreSQL connection for {@link PostgreSQLPersistenceAdapter}.
 */
export abstract class PostgreSQLConnection {

    public abstract query(query: string, params?: (any)[]): Promise<pg.QueryResult<any>>;
    protected abstract connect(): Promise<pg.PoolClient> | Promise<void>
    public abstract end(): Promise<void>
}

/**
 * PostgreSQL Pool connection extending {@link PostgreSQLConnection}.
 */
export class PgPoolConnection extends PostgreSQLConnection {
    private pool: pg.Pool;
    constructor(config: pg.PoolConfig) {
        super()
        this.pool = new pg.Pool(config);
    }

    protected async connect(): Promise<pg.PoolClient> {
        const connectResult = this.pool.connect();
        return new Promise<pg.PoolClient>((resolve) => {
            resolve(connectResult);
        });
    }

    public async query(query: string, params?: (any)[]): Promise<pg.QueryResult<any>> {
        const connection = await this.connect()
        const queryResult = this.pool.query(query, params);
        const releasePoolConnection = await connection.release();
        return new Promise<pg.QueryResult<any>>((resolve) => {
            resolve(queryResult);
        });
    }

    public async end(): Promise<void> {
        const endResult = this.pool.end();
        new Promise<void>((resolve) => {
            resolve(endResult);
        });
    }
}

/**
 * PostgreSQL Client connection extending {@link PostgreSQLConnection}.
 */
export class PgClientConnection extends PostgreSQLConnection {
    private client: pg.Client;
    constructor(config: pg.ClientConfig) {
        super()
        this.client = new pg.Client(config);
        this.connect()
    }

    public async end(): Promise<void> {
        const endResult = this.client.end();
        new Promise<void>((resolve) => {
            resolve(endResult);
        });
    }

    protected async connect(): Promise<void> {
        const connectResult = this.client.connect();
        new Promise<void>((resolve) => {
            resolve(connectResult);
        });
    }

    public async query(query: string, params?: (any)[]): Promise<pg.QueryResult<any>> {
        const queryResult = this.client.query(query, params);
        return new Promise<pg.QueryResult<any>>(async (resolve) => {
            resolve(queryResult);
        });
    }
}

/**
 * Implementation of {@link PersistenceAdapter} using PostgreSQL.
 */
export class PostgreSQLPersistenceAdapter implements PersistenceAdapter {
  protected tableName: string;
  protected partitionKeyName: string;
  protected attributesName: string;
  protected partitionKeyGenerator: PartitionKeyGenerator;
    protected connection: PostgreSQLConnection;

    constructor(params: PostgreSQLPersistenceAdapterParams) {
        this.tableName = params.tableName;
        this.partitionKeyName = params.partitionKeyName ? params.partitionKeyName : 'user_id';
        this.attributesName = params.attributesName ? params.attributesName : 'attributes';
        this.partitionKeyGenerator = params.partitionKeyGenerator ? params.partitionKeyGenerator : PartitionKeyGenerators.userId;
        this.connection = params.connection;
  }

  /**
   * Retrieves persistence attributes from PostgreSQL database.
   * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
   * @returns {Promise<Object.<string, any>>}
   */
  public async getAttributes(requestEnvelope: RequestEnvelope): Promise<{ [key: string]: any }> {
        const statement = `SELECT ${this.attributesName} FROM ${this.tableName} WHERE ${this.partitionKeyName}=$1`
        const query = await this.connection.query(statement, [this.partitionKeyGenerator(requestEnvelope)])
        const queryReturn = query.rows[0].attributes
        console.log('get return:', queryReturn)
        return queryReturn;
  }

  /**
   * Saves persistence attributes to PostgreSQL database.
   * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
   * @param {Object.<string, any>} attributes Attributes to be saved to PostgreSQL database.
   * @return {Promise<void>}
   */
  public async saveAttributes(requestEnvelope: RequestEnvelope, attributes: { [key: string]: any }): Promise<void> {
        const statement =
            `INSERT INTO ${this.tableName}(${this.partitionKeyName},${this.attributesName}) 
            VALUES ($1,$2) 
            ON CONFLICT (${this.partitionKeyName}) DO UPDATE 
            SET attributes = $2`
        const result = await this.connection.query(statement, [this.partitionKeyGenerator(requestEnvelope), attributes])
        console.log('save result:', result)
  }

  /**
   * Delete persistence attributes from PostgreSQL database.
   * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
   * @return {Promise<void>}
   */
  public async deleteAttributes(requestEnvelope: RequestEnvelope): Promise<void> {
    console.log('do nothing');
  }
}
