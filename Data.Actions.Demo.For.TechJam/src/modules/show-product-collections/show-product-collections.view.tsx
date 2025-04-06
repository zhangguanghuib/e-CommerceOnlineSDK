/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';
import { IShowProductCollectionsViewProps } from './show-product-collections';
import { SimpleProduct } from '@msdyn365-commerce/retail-proxy';

export default (props: IShowProductCollectionsViewProps) => {
    const { productCollections } = props;
    return (
        <div className='row'>
            {productCollections && productCollections.length > 0 ? (
                productCollections.map((simpleProduct: SimpleProduct, index: number) => (
                    <div key={index} className='col-4'>
                        <div className='card'>
                            <img
                                src={simpleProduct.PrimaryImageUrl}
                                alt='product'
                                className='card-img-top'
                                style={{ maxWidth: '450px', maxHeight: '450px' }}
                            />
                            <div className='card-body'>
                                <h4 className='msc-product__title'>Product Number: {simpleProduct.ProductNumber}</h4>
                                <h4 className='msc-product__title'>Product Name: {simpleProduct.Name}</h4>
                                <h4 className='msc-price__price'>Product Price: {simpleProduct.Price}</h4>
                                <span className='badge bg-info text-dark p-2 rounded'>{simpleProduct.Description}</span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No item availabilities found.</p>
            )}
        </div>
    );
};
