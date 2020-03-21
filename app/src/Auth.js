import React, { useEffect } from 'react';
import * as OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

import config from './config';

const Auth = () => {
    useEffect(() => {
        const { pkce, issuer, clientId, redirectUri, scopes } = config.oidc;
        const widget = new OktaSignIn({
            /**
             * Note: when using the Sign-In Widget for an OIDC flow, it still
             * needs to be configured with the base URL for your Okta Org. Here
             * we derive it from the given issuer for convenience.
             */
            baseUrl: process.env.REACT_APP_BASEURL,
            clientId,
            redirectUri,
            features: {
                registration: true
            },
            // logo: '../public/logo192.png',
            i18n: {
                en: {
                    'primaryauth.title': 'Sign in',
                },
            },
            authParams: {
                pkce,
                issuer,
                display: 'page',
                scopes,
            },
        });

        widget.renderEl(
            { el: '#sign-in-widget' },
            () => {
                /**
                 * In this flow, the success handler will not be called beacuse we redirect
                 * to the Okta org for the authentication workflow.
                 */
            },
            (err) => {
                throw err;
            },
        );
    }, []);

    return (
        <div>
            <div id="sign-in-widget" />
        </div>
    );
};
export default Auth;