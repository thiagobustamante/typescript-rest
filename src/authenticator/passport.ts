'use strict';
import * as express from 'express';
import * as _ from 'lodash';
import * as passport from 'passport';
import { ServiceAuthenticator } from '../server/model/server-types';
import { Strategy } from 'passport-strategy';

export interface PassportAuthenticatorOptions {
    authOptions?: passport.AuthenticateOptions;
    rolesKey?: string;
    serializeUser?: (user: any) => string | Promise<string>;
    deserializeUser?: (user: string) => any;
}

export interface PassportAuthenticatorStrategy {
    strategy: Strategy;
    name: string;
}

export class PassportAuthenticator implements ServiceAuthenticator {
    private authenticator: express.Handler;
    private options: PassportAuthenticatorOptions;

    constructor(strategies: Array<PassportAuthenticatorStrategy>, options: PassportAuthenticatorOptions = {}) {
        this.options = options;
        var strategyNames: Array<string> = [];

        strategies.forEach(strategy => {
            strategyNames.push(strategy.name)
            passport.use(strategy.name, strategy.strategy);
        });

        this.authenticator = passport.authenticate(strategyNames, options.authOptions || {});
    }

    public getMiddleware(): express.RequestHandler {
        return this.authenticator;
    }

    public getRoles(req: express.Request): Array<string> {
        const roleKey = this.options.rolesKey || 'roles';
        return _.castArray(_.get(req.user, roleKey, []));
    }

    public initialize(router: express.Router): void {
        router.use(passport.initialize());
        const useSession = _.get(this.options, 'authOptions.session', true);
        if (useSession) {
            router.use(passport.session());
            if (this.options.serializeUser && this.options.deserializeUser) {
                passport.serializeUser((user: any, done: (a: any, b: string) => void) => {
                    Promise.resolve(this.options.serializeUser(user))
                        .then((result: string) => {
                            done(null, result);
                        }).catch((err: Error) => {
                            done(err, null);
                        });
                });
                passport.deserializeUser((user: string, done: (a: any, b: any) => void) => {
                    Promise.resolve(this.options.deserializeUser(user))
                        .then((result: any) => {
                            done(null, result);
                        }).catch((err: Error) => {
                            done(err, null);
                        });
                });
            }
        }
    }
}