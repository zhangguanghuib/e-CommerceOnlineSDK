/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import { AsyncResult, SimpleProduct } from '@msdyn365-commerce/retail-proxy';
//import { IGetSimpleproductWithAvailabilityData } from '../../actions/get-simpleproduct-with-availability.action';

export interface IGetProductinfoWhenPageloadData {
    simpleproductWithAvailabilities: AsyncResult<SimpleProduct>;
    actionResponse: { text: string };
}
