import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Popup from './components/popup';

const bo = chrome || browser;

function main () {

     bo.runtime.sendMessage({
        type: 'localLookup',
        payload: {
            userId: 'local' 
        }
     }, ucfg => {
        const publicKey = ucfg ? ucfg.publicKey : 'missingPublicKey';
        ReactDOM.render(
            <MuiThemeProvider>
                <Popup publicKey={publicKey} />
            </MuiThemeProvider>,
            document.getElementById('main')
        )
    });
}

main();
