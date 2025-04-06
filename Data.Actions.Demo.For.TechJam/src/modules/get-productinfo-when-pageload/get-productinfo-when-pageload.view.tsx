/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';
import { IGetProductinfoWhenPageloadViewProps } from './get-productinfo-when-pageload';

export default (props: IGetProductinfoWhenPageloadViewProps) => {
    const { getSimpleproductWithAvailabilityData } = props;
    const simpleProduct = getSimpleproductWithAvailabilityData;
    // const orgUnitAvailabilities = getSimpleproductWithAvailabilityData?.orgUnitAvailabilities;
    return (
        <div className='container'>
            {/* Render simpleProduct if available */}
            {simpleProduct && simpleProduct.RecordId ? (
                <div className='ms-search-result-container_Products'>
                    <ul className='list-unstyles'>
                        <li className='ms-product-search-result__item'>
                            <img
                                src={simpleProduct.PrimaryImageUrl}
                                alt='product'
                                className='img-fluid p-3'
                                style={{ maxWidth: '450px', maxHeight: '450px' }}
                            />
                            <h4 className='msc-product__title'>Product ID: {simpleProduct.RecordId}</h4>
                            <h4 className='msc-product__title'>Product Number: {simpleProduct.ProductNumber}</h4>
                            <h4 className='msc-product__title'>Product Name: {simpleProduct.Name}</h4>
                            <h4 className='msc-price__price'>Product Price: {simpleProduct.Price}</h4>
                            <span className='badge bg-info text-dark p-2 rounded'>
                                <strong> Product Description:</strong> {simpleProduct.Description}
                            </span>
                        </li>
                    </ul>
                </div>
            ) : (
                <div>No product found, is it true?</div>
            )}
        </div>
    );
};
