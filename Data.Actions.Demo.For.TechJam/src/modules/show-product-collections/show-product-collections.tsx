/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';

import { IActionContext, ICommerceApiSettings } from '@msdyn365-commerce/core';
import { IShowProductCollectionsData } from './show-product-collections.data';
import { IShowProductCollectionsProps } from './show-product-collections.props.autogenerated';
import { SimpleProduct } from '@msdyn365-commerce/retail-proxy';
import { ProductInput, getSimpleProductsAction } from '@msdyn365-commerce-modules/retail-actions';
import { generateProductImageUrl } from '../../utilities/utils';

export interface IShowProductCollectionsViewProps extends IShowProductCollectionsProps<IShowProductCollectionsData> {
    productCollections: SimpleProduct[];
}

export interface IShowProductCollectionsState {
    productCollections: SimpleProduct[];
}

class ShowProductCollections extends React.PureComponent<
    IShowProductCollectionsProps<IShowProductCollectionsData>,
    IShowProductCollectionsState
> {
    constructor(props: IShowProductCollectionsProps<IShowProductCollectionsData>) {
        super(props);
        this.state = {
            productCollections: []
        };
    }
    public async componentDidMount(): Promise<void> {
        const { config, context } = this.props;
        const ctx: IActionContext = context.actionContext;
        const channelId: number = context.actionContext.requestContext.apiSettings.channelId;
        const apiSettings: ICommerceApiSettings = context.actionContext.requestContext.apiSettings;
        if (config && config.productIds) {
            const productIds: string[] = config.productIds.split(',');
            const productInputs: ProductInput[] = productIds.map((productId: string) => {
                return new ProductInput(productId, apiSettings, channelId, undefined, ctx.requestContext);
            });
            let productCollections: SimpleProduct[] = await getSimpleProductsAction(productInputs, ctx);
            productCollections = productCollections.map((product: SimpleProduct) => {
                if (!product.PrimaryImageUrl) {
                    product.PrimaryImageUrl = generateProductImageUrl(product, apiSettings);
                }
                return product;
            });
            this.setState({
                productCollections: productCollections
            });
        }
    }

    public render(): JSX.Element | null {
        const showProductCollectionsViewProps = {
            ...this.props,
            productCollections: this.state.productCollections
        };
        return this.props.renderView(showProductCollectionsViewProps);
    }
}

export default ShowProductCollections;
