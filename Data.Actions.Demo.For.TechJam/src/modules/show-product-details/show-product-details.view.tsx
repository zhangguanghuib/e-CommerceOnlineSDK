/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */
import * as React from 'react';
//import { generateImageUrl } from '@msdyn365-commerce-modules/retail-actions';
import { IShowProductDetailsViewProps } from './show-product-details';

export default (props: IShowProductDetailsViewProps) => {
    const { simpleProduct, getProductInfo } = props;
    const [newProductId, setNewProductId] = React.useState(simpleProduct?.RecordId);

    const handleProductIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newProductId = Number(event.target.value);
        console.log('newProductId', newProductId);
        setNewProductId(newProductId);
    };
    const handleInputSubmit = () => {
        console.log('Final input value:', newProductId);
        if (newProductId !== undefined && newProductId !== null && newProductId !== 0) {
            //handleNewProductId(newProductId);
            getProductInfo(newProductId);
        }
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (newProductId !== undefined && newProductId !== null && newProductId !== 0) {
                //handleNewProductId(newProductId);
                getProductInfo(newProductId);
            }
        }
    };
    console.log('simpleProduct', simpleProduct);
    return (
        <div className='container'>
            <div>
                <button type='button' className='btn btn-primary' onClick={() => getProductInfo(newProductId || 0)}>
                    Get Product Info!
                </button>
                <input
                    type='text'
                    value={newProductId}
                    onChange={handleProductIdChange}
                    onBlur={handleInputSubmit}
                    onKeyDown={handleKeyDown}
                    className='form-control'
                    style={{ marginLeft: '10px' }}
                />
            </div>

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
                            <span className='badge bg-info text-dark p-2 rounded'>{simpleProduct.Description}</span>
                        </li>
                    </ul>
                </div>
            ) : (
                <div>No product found</div>
            )}
        </div>
    );
};
