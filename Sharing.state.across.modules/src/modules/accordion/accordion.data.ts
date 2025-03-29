/*--------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * See License.txt in the project root for license information.
 *--------------------------------------------------------------*/

import { AsyncResult } from '@msdyn365-commerce/retail-proxy';

import { IAccordionExpandedState } from '../../actions/accordion-state.action';

export interface IAccordionData {
    accordionExpandedState: AsyncResult<IAccordionExpandedState>;
}
