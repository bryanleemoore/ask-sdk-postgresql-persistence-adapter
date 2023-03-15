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

import { describe, expect, test } from '@jest/globals';
import { PostgreSQLPersistenceAdapter, PgPoolConnection, PgClientConnection } from '../lib'
import { MockRequestEnvelope } from './mock/MockRequestEnvelope';
import * as dotenv from 'dotenv'

dotenv.config()

const PgConnectionConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '3000', 10)
}

describe('PostgreSQLPersistenceAdapter with Client', () => {
  let adapter: PostgreSQLPersistenceAdapter
  let testConnection = new PgClientConnection(PgConnectionConfig)
  beforeAll(async () => {
    adapter = new PostgreSQLPersistenceAdapter({
      tableName: 'test_table_client',
      partitionKeyName: 'aws_id',
      connection: testConnection
    })
  })


  test('get attributes from empty table should return empty object {}', async () => {
    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual({});
  });

  test('save new attributes should save to empty table and be retrieved by get attributes', async () => {
    let attributes = {
      name : 'test_name',
      year: 2023,
      database : 'postgresql'
    }

    await adapter.saveAttributes(MockRequestEnvelope.requestEnvelope(),attributes)

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual(attributes)
  });
  
  test('editing attributes, saving them, and retrieving them should return updated attributes', async() => { 
    const attributes = await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())
    const yearIncrement = 1000
    const updatedYear = attributes.year + yearIncrement
    attributes.year += yearIncrement

    await adapter.saveAttributes(MockRequestEnvelope.requestEnvelope(),attributes)

    const expectedAttributes = {
      name : 'test_name',
      year: updatedYear,
      database : 'postgresql'
    }

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual(expectedAttributes)    
  })

  test('after deleting attributes should return an empty object {} upon retrieval', async() => {
    await adapter.deleteAttributes(MockRequestEnvelope.requestEnvelope())

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual({});
  })

  afterAll(async () => {
    await testConnection.query('DROP TABLE "test_table_client"'); 
    await testConnection.end();
  })
});

describe('PostgreSQLPersistenceAdapter with Pool', () => {
  let adapter: PostgreSQLPersistenceAdapter
  let testConnection = new PgPoolConnection(PgConnectionConfig)
  beforeAll(async () => {
    adapter = new PostgreSQLPersistenceAdapter({
      tableName: 'test_table_pool',
      partitionKeyName: 'aws_id',
      connection: testConnection
    })
  })


  test('get attributes from empty table should return empty object {}', async () => {
    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual({});
  });

  test('save new attributes should save to empty table and be retrieved by get attributes', async () => {
    let attributes = {
      name : 'test_name',
      year: 2023,
      database : 'postgresql'
    }

    await adapter.saveAttributes(MockRequestEnvelope.requestEnvelope(),attributes)

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual(attributes)
  });
  
  test('editing attributes, saving them, and retrieving them should return updated attributes', async() => { 
    const attributes = await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())
    const yearIncrement = 1000
    const updatedYear = attributes.year + yearIncrement
    attributes.year += yearIncrement

    await adapter.saveAttributes(MockRequestEnvelope.requestEnvelope(),attributes)

    const expectedAttributes = {
      name : 'test_name',
      year: updatedYear,
      database : 'postgresql'
    }

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual(expectedAttributes)    
  })

  test('after deleting attributes should return an empty object {} upon retrieval', async() => {
    await adapter.deleteAttributes(MockRequestEnvelope.requestEnvelope())

    expect(await adapter.getAttributes(MockRequestEnvelope.requestEnvelope())).toStrictEqual({});
  })

  afterAll(async () => {
    await testConnection.query('DROP TABLE "test_table_pool"'); 
    await testConnection.end();
  })
});