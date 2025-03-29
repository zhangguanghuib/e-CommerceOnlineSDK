/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import { AsyncResult } from '@msdyn365-commerce/retail-proxy';

import { IAccordionExpandedState } from '../../actions/accordion-state.action';

export interface IAccordionv1Data {
    accordionExpandedState: AsyncResult<IAccordionExpandedState>;
}
