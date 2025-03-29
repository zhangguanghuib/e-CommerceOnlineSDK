import { createObservableDataAction, IAction, IActionInput } from '@msdyn365-commerce/core';
import { GenericInput, getGenericAction } from '@msdyn365-commerce-modules/retail-actions';

export interface IAccordionExpandedState {
    isAllExpanded?: boolean;
}

export function createAccordionStateInput(result: IAccordionExpandedState): GenericInput<IAccordionExpandedState> {
    console.log('createAccordionStateInput from customized from GHZ');
    return new GenericInput<IAccordionExpandedState>('accordionExpandedState', result, 'IAccordionExpandedState');
}

const createAccordionStateInputInternal = (): IActionInput => {
    return createAccordionStateInput({});
};

export const getGenericActionDataAction = createObservableDataAction({
    action: <IAction<IAccordionExpandedState>>getGenericAction,
    input: createAccordionStateInputInternal
});

export default getGenericActionDataAction;
