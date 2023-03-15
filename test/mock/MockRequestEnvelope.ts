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

import { Intent, RequestEnvelope, Slot } from 'ask-sdk-model';

export const MockRequestEnvelope = {
  requestEnvelope(): RequestEnvelope {
    return {
      version: '1.0',
      session: {
        new: true,
        sessionId: process.env.SESSION_ID as string,
        application: {
          applicationId: process.env.APPLICATION_ID as string,
        },
        attributes: {},
        user: {
          userId: process.env.USER_ID as string,
        },
      },
      context: {
        Viewports: [
          {
            type: 'APL',
            id: 'main',
            shape: 'RECTANGLE',
            dpi: 213,
            presentationType: 'STANDARD',
            canRotate: false,
            configuration: {
              current: {
                mode: 'HUB',
                video: {
                  codecs: ['H_264_42', 'H_264_41'],
                },
                size: {
                  type: 'DISCRETE',
                  pixelWidth: 1280,
                  pixelHeight: 800,
                },
              },
            },
          },
        ],
        Viewport: {
          experiences: [
            {
              arcMinuteWidth: 346,
              arcMinuteHeight: 216,
              canRotate: false,
              canResize: false,
            },
          ],
          mode: 'HUB',
          shape: 'RECTANGLE',
          pixelWidth: 1280,
          pixelHeight: 800,
          dpi: 213,
          currentPixelWidth: 1280,
          currentPixelHeight: 800,
          touch: ['SINGLE'],
          video: {
            codecs: ['H_264_42', 'H_264_41'],
          },
        },
        Extensions: {
          available: {
            'aplext:backstack:10': {},
          },
        },
        System: {
          application: {
            applicationId: process.env.APPLICATION_ID as string,
          },
          user: {
            userId: process.env.USER_ID as string,
          },
          device: {
            deviceId: process.env.DEVICE_ID as string,
            supportedInterfaces: {},
          },
          apiEndpoint: 'https://api.amazonalexa.com',
          apiAccessToken:
            process.env.API_ACCESS_TOKEN as string,
        },
      },
      request: {
        type: 'LaunchRequest',
        requestId: process.env.REQUEST_ID as string,
        locale: 'en-US',
        timestamp: '2023-03-11T06:29:29Z',
      },
    };
  },
};
