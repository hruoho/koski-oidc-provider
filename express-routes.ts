/* eslint-disable no-console, camelcase, no-unused-vars */
import { urlencoded } from 'express'; // eslint-disable-line import/no-unresolved

import { errors } from 'oidc-provider';
import cookieParser from 'cookie-parser'

const body = urlencoded({ extended: false });
const keys = new Set();

const { SessionNotFound } = errors;
export default (app, provider) => {
    function setNoCache(req, res, next) {
        res.set('cache-control', 'no-store');
        next();
    }
    app.use(cookieParser())

    app.get('/interaction/:uid', setNoCache, async (req, res, next) => {
        try {
            const interactionDetails = await provider.interactionDetails(req, res);
            const {
                uid, prompt, params, session,
            } = interactionDetails;

            console.log('*** /interaction/:uid', interactionDetails)

            const returnUrlAfterKoskiAuth = `http://localhost:3000/interaction/${uid}/login`

            return session
                ? res.redirect(`http://localhost:3000/interaction/${uid}/confirm`)
                : res.redirect(`http://localhost:7021/koski/login/oppija/local?redirect=${returnUrlAfterKoskiAuth}`)

        } catch (err) {
            return next(err);
        }
    });

    app.get('/interaction/:uid/login', setNoCache, async (req, res, next) => {
        try {
            const interactionDetails = await provider.interactionDetails(req, res);
            console.log('*** /interaction/:uid/login', interactionDetails)

            // tää pitäis lukea payloadista tms
            const result = {
                login: {
                    accountId: "mock-account-id"
                },
            };

            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } catch (err) {
            next(err);
        }
    })

    app.get('/interaction/:uid/confirm', setNoCache, async (req, res, next) => {
        try {
            const interactionDetails = await provider.interactionDetails(req, res);
            console.log('*** /interaction/:uid/confirm', interactionDetails)
            const { prompt: { name, details }, params, /* session: { accountId } */ } = interactionDetails;
            // assert.equal(name, 'consent'); // now equals 'login'

            const accountId = 'mock-account-id'

            let { grantId } = interactionDetails;
            let grant;

            if (grantId) {
                // we'll be modifying existing grant in existing session
                grant = await provider.Grant.find(grantId);
            } else {
                // we're establishing a new grant
                grant = new provider.Grant({
                    accountId,
                    clientId: params.client_id,
                });
            }

            if (details.missingOIDCScope) {
                grant.addOIDCScope(details.missingOIDCScope.join(' '));
            }
            if (details.missingOIDCClaims) {
                grant.addOIDCClaims(details.missingOIDCClaims);
            }
            if (details.missingResourceScopes) {
                /*for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
                    grant.addResourceScope(indicator, scopes.join(' '));
                }*/
                console.warn(details.missingResourceScopes)
            }

            grantId = await grant.save();

            const consent = {grantId};
            if (!interactionDetails.grantId) {
                // we don't have to pass grantId to consent, we're just modifying existing one
                consent.grantId = grantId;
            }

            const result = { consent };
            console.log('RESULT', result)
            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
        } catch (err) {
            next(err);
        }
    });

    app.get('/interaction/:uid/abort', setNoCache, async (req, res, next) => {
        try {
            const result = {
                error: 'access_denied',
                error_description: 'End-User aborted interaction',
            };
            await provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        } catch (err) {
            next(err);
        }
    });

    app.use((err, req, res, next) => {
        if (err instanceof SessionNotFound) {
            // handle interaction expired / session not found error
        }
        next(err);
    });
};
