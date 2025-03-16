/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */
import { AsyncResult } from '@msdyn365-commerce/retail-proxy';
import { ILocation, IWeatherConditions } from '../../actions/get-current-weather-conditions.action';

export interface ISampleCurrentConditionsData {
    favorite_locations: AsyncResult<ILocation[]>;
    forecast: AsyncResult<IWeatherConditions[]>;
}
