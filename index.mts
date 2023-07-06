import express from 'express'
import {createDynamoDBAdapter} from "./dynamodb-adapter.mts"
import Provider from "oidc-provider"

import routes from './express-routes.js'

const configuration = {
    clients: [{
        client_id: 'zELcpfANLqY7Oqas',
        client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
        redirect_uris: ['http://localhost:3001/cb'],
        // ...
    }],
    /*interactions: {
        // this is '/interaction/:uid' by default
        url(ctx: any, interaction: any) {},
    },*/
    features: {
        devInteractions: { enabled: false }, // defaults to true
        deviceFlow: { enabled: true }, // defaults to false
        revocation: { enabled: true }, // defaults to false
    },
    async findAccount(ctx: any, id: any) {
        return {
            accountId: id,
            async claims() { return { sub: id }; },
        };
    }
};

let adapter

if (process.env.DYNAMODB_URI) {
    adapter = createDynamoDBAdapter("bar")
}

const provider = new Provider('http://localhost:3000', {adapter, ...configuration})

const app = express();

provider.use(async (ctx, next) => {
    await next();

    console.log('provider middleware sees:', ctx.oidc?.route, ctx.req.method, ctx.req.url)

    if (ctx.oidc?.route === 'userinfo') {
        console.log('Route /userinfo called by client %s', ctx.oidc.entities.AccessToken.clientId)
    }
});

routes(app, provider)

app.use(provider.callback());

const server = app.listen(3000, () => {
    console.log(`application is listening on port 3000, check its /.well-known/openid-configuration`);
});

