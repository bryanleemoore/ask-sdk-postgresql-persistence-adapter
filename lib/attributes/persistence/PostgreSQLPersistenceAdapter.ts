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
import { PostgreSQLConnection } from './PostgreSQLConnection';

export type PostgreSQLPersistenceAdapterParams = {
    tableName: string;
    partitionKeyName?: string;
    attributesName?: string;
    partitionKeyGenerator?: PartitionKeyGenerator;
    connection: PostgreSQLConnection;
};

/**
 * Implementation of {@link PersistenceAdapter} using PostgreSQL.
 */
export class PostgreSQLPersistenceAdapter implements PersistenceAdapter {
    protected tableName: string;
    protected partitionKeyName: string;
    protected attributesName: string;
    protected partitionKeyGenerator: PartitionKeyGenerator;
    protected connection: PostgreSQLConnection;
    private connectionChecked: boolean;
    private tableExistsChecked: boolean;

    constructor(params: PostgreSQLPersistenceAdapterParams) {
        const {
            tableName,
            partitionKeyName = 'id',
            attributesName = 'attributes',
            partitionKeyGenerator = PartitionKeyGenerators.userId,
            connection,
        } = params;

        this.tableName = tableName;
        this.partitionKeyName = partitionKeyName;
        this.attributesName = attributesName;
        this.partitionKeyGenerator = partitionKeyGenerator;
        this.connection = connection;
        this.connectionChecked = false;
        this.tableExistsChecked = false;
    }

    private async checkIfTableExists(): Promise<boolean> {
        const statement = `SELECT EXISTS (SELECT table_name FROM information_schema.tables WHERE table_name = $1)`;
        const result = await this.connection.query(statement, [this.tableName]);

        return result.rows[0].exists;
    }
    private async checkIfAttributesExists(partionKeyValue: string): Promise<boolean> {
        const statement = `SELECT EXISTS(SELECT ${this.attributesName} FROM ${this.tableName} WHERE ${this.partitionKeyName} = $1)`;
        const result = await this.connection.query(statement, [partionKeyValue]);

        return result.rows[0].exists;
    }

    private async getAttributesQuery(partionKeyValue: string): Promise<{ [key: string]: any }> {
        const statement = `SELECT ${this.attributesName} FROM ${this.tableName} WHERE ${this.partitionKeyName} = $1`;
        const result = await this.connection.query(statement, [partionKeyValue]);

        return result.rows[0].attributes;
    }

    private async saveAttributeQuery(partitionKeyValue: string, attributes: { [key: string]: any }): Promise<void> {
        const statement = `INSERT INTO ${this.tableName}(${this.partitionKeyName},${this.attributesName}) VALUES ($1,$2) ON CONFLICT (${this.partitionKeyName}) DO UPDATE SET attributes = $2`;

        await this.connection.query(statement, [partitionKeyValue, attributes]);
    }

    private async deleteAttributesQuery(partitionKeyValue: string): Promise<void> {
        const statement = `DELETE FROM ${this.tableName} WHERE ${this.partitionKeyName} = $1`;

        await this.connection.query(statement, [partitionKeyValue]);
    }

    private async createTable(): Promise<void> {
        const statement = `CREATE TABLE ${this.tableName}(serial_primary_key SERIAL PRIMARY KEY, ${this.partitionKeyName} TEXT UNIQUE NOT NULL, ${this.attributesName} JSON NOT NULL);`;

        await this.connection.query(statement);
    }

    private async doPreQueryCheck(): Promise<void> {
        if (!this.connectionChecked) {
            await this.connection.checkConnection();
            this.connectionChecked = true;
        }
        if (!this.tableExistsChecked) {
            const doesTableExists = await this.checkIfTableExists();
            if (!doesTableExists) {
                await this.createTable();
            }
            this.tableExistsChecked = true;
        }
    }

    /**
     * Retrieves persistence attributes from PostgreSQL database.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @returns {Promise<Object.<string, any>>}
     */
    public async getAttributes(requestEnvelope: RequestEnvelope): Promise<{ [key: string]: any }> {
        try {
            await this.doPreQueryCheck();
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not establish connection to database on table (${this.tableName}): ${err.message}`,
                );
            }
        }

        const partitionKeyValue = this.partitionKeyGenerator(requestEnvelope);

        try {
            const doesRowExist = await this.checkIfAttributesExists(partitionKeyValue);

            if (doesRowExist) return await this.getAttributesQuery(partitionKeyValue);
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not read item (${this.partitionKeyGenerator(requestEnvelope)}) from table (${this.tableName}): ${err.message}`,
                );
            }
        }
        return {};
    }

    /**
     * Saves persistence attributes to PostgreSQL database.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @param {Object.<string, any>} attributes Attributes to be saved to PostgreSQL database.
     * @return {Promise<void>}
     */
    public async saveAttributes(requestEnvelope: RequestEnvelope, attributes: { [key: string]: any }): Promise<void> {
        try {
            await this.doPreQueryCheck();
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not establish connection to database on table (${this.tableName}): ${err.message}`,
                );
            }
        }

        const partitionKeyValue = this.partitionKeyGenerator(requestEnvelope);

        try {
            await this.saveAttributeQuery(partitionKeyValue, attributes);
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not save item (${this.partitionKeyGenerator(requestEnvelope)}) on table (${this.tableName}): ${err.message}`,
                );
            }
        }
    }

    /**
     * Delete persistence attributes from PostgreSQL database.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @return {Promise<void>}
     */
    public async deleteAttributes(requestEnvelope: RequestEnvelope): Promise<void> {
        try {
            await this.doPreQueryCheck();
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not establish connection to database on table (${this.tableName}): ${err.message}`,
                );
            }
        }

        const partitionKeyValue = this.partitionKeyGenerator(requestEnvelope);

        try {
            await this.deleteAttributesQuery(partitionKeyValue);
        } catch (err) {
            if (err instanceof Error) {
                throw createAskSdkError(
                    this.constructor.name,
                    `Could not delete item (${this.partitionKeyGenerator(requestEnvelope)}) on table (${this.tableName}): ${err.message}`,
                );
            }
        }
    }
}
