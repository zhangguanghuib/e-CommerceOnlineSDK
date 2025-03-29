import * as React from 'react';
import { Module, Node } from '@msdyn365-commerce-modules/utilities';
import { IAccordionItemViewProps } from './accordion-item';

const AccordionItemView: React.FC<IAccordionItemViewProps> = (props: IAccordionItemViewProps): JSX.Element => {
    const { drawer, accordionSlots, AccordionItemContainer, AccordionItemContent } = props;
    return (
        <Module {...AccordionItemContainer}>
            <Node {...drawer}>
                <Node {...AccordionItemContent}>
                    {accordionSlots &&
                        accordionSlots.accordionItemContent &&
                        accordionSlots.accordionItemContent.length &&
                        _renderAccordionItemContent(accordionSlots.accordionItemContent)}
                </Node>
            </Node>
        </Module>
    );
};

const _renderAccordionItemContent = (items: React.ReactNode[]): JSX.Element | null => {
    return (
        <>
            {items && items.length > 0
                ? items.map((item: React.ReactNode, index: number) => {
                      return <React.Fragment key={index}>{item}</React.Fragment>;
                  })
                : null}
        </>
    );
};

export default AccordionItemView;
