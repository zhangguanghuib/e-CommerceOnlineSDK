/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';
import { useState } from 'react';
import { ICookieTestViewProps } from './cookie-test';

export default (props: ICookieTestViewProps) => {
    const [favColor, setFavColor] = useState('');

    const setCookieValue = () => {
        if (props.context.request.cookies.isConsentGiven()) {
            props.context.request.cookies.set<string>('favoriteColor', favColor);
        }
        alert(`set cookie to ${favColor}`);
    };

    const getCookieValue = () => {
        const faColor = props.context.request.cookies.get<string>('favoriteColor');
        alert(`get cookie value ${faColor.name} = ${faColor.value}`);
    };

    return (
        <div className='row'>
            <input type='text' onChange={e => setFavColor(e.target.value)} placeholder='Enter your favorite color' />
            <br></br>
            <button onClick={setCookieValue}>Set Cookie</button>
            <br></br>
            <button onClick={getCookieValue}>Get Cookie</button>
        </div>
    );
};
