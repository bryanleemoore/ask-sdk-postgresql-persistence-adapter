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

import { createAskSdkError } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';

/**
 * Type definition of function used by {@link PostgreSQLPersistenceAdapter} to extract attributes id from {@link RequestEnvelope}.
 */
export type PartitionKeyGenerator = (requestEnvelope: RequestEnvelope) => string;

/**
 * Object containing implementations of {@link PartitionKeyGenerator}.
 */
export const PartitionKeyGenerators = {
    /**
     * Gets attributes id using user id.
     * @param {RequestEnvelope} requestEnvelope
     * @returns {string}
     */
    userId(requestEnvelope: RequestEnvelope): string {
        if (!requestEnvelope?.context?.System?.user?.userId) {
            throw createAskSdkError('PartitionKeyGenerators', 'Cannot retrieve user id from request envelope!');
        }
        return requestEnvelope.context.System.user.userId;
    },

    /**
     * Gets attributes id using device id.
     * @param {RequestEnvelope} requestEnvelope
     * @returns {string}
     */
    deviceId(requestEnvelope: RequestEnvelope): string {
        if (!requestEnvelope?.context?.System?.device?.deviceId) {
            throw createAskSdkError('PartitionKeyGenerators', 'Cannot retrieve device id from request envelope!');
        }
        return requestEnvelope.context.System.device.deviceId;
    },

    /**
     * Gets attributes id using person id.
     * Fallback to fetching attributes id using user id, if personId is not present.
     * @param {RequestEnvelope} requestEnvelope
     * @returns {string}
     */
    personId(requestEnvelope: RequestEnvelope): string {
        if (requestEnvelope?.context?.System?.person?.personId) {
            return requestEnvelope.context.System.person.personId;
        }
        return PartitionKeyGenerators.userId(requestEnvelope);
    },
};
