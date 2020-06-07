/* eslint-disable */
import React from 'react';
import { render } from 'react-dom';
import Opinions from './components/Opinions';

render(
    <div>
        <Opinions AppKey={'f32cf350-a610-418a-ac94-7b0fd125a77c'} pageSize = {1} userId={'b12aa065-151b-4a1c-911e-60cc6763156b'} />
    </div>
    ,
    document.getElementById('root'));
