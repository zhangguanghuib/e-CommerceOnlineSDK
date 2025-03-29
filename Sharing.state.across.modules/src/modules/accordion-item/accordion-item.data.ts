import { AsyncResult } from '@msdyn365-commerce/retail-proxy';

import { IAccordionExpandedState } from '../../actions/accordion-state.action';

export interface IAccordionItemData {
    accordionExpandedState: AsyncResult<IAccordionExpandedState>;
}
