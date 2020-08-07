/**
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { getEndSessionEndpoint, resetOPConfiguration } from "./op-config";
import { endAuthenticatedSession, getSessionParameter } from "./session";
import { CALLBACK_URL, ID_TOKEN } from "../constants";
import { STORAGE } from "../constants/storage";
import { SessionData } from "../models";

/**
 * Execute user sign out request
 *
 * @param {object} requestParams
 * @param {function} callback
 * @returns {Promise<any>} sign out request status
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function sendSignOutRequest(storage: STORAGE.sessionStorage): Promise<any>;
export function sendSignOutRequest(storage: STORAGE, session: SessionData): Promise<any>;
export function sendSignOutRequest(storage: STORAGE, session?: SessionData): Promise<any> {
    const logoutEndpoint = getEndSessionEndpoint(storage, session);

    if (!logoutEndpoint || logoutEndpoint.trim().length === 0) {
        return Promise.reject(new Error("No logout endpoint found in the session."));
    }

    const idToken = getSessionParameter(ID_TOKEN, storage, session);

    if (!idToken || idToken.trim().length === 0) {
        return Promise.reject(new Error("Invalid id_token found in the session."));
    }

    const callbackURL = getSessionParameter(CALLBACK_URL, storage, session);

    if (!callbackURL || callbackURL.trim().length === 0) {
        return Promise.reject(new Error("No callback URL found in the session."));
    }

    endAuthenticatedSession(storage, session);
    resetOPConfiguration(storage, session);

    const logoutCallback =
        `${logoutEndpoint}?` + `id_token_hint=${idToken}` + `&post_logout_redirect_uri=${callbackURL}`;

    if (storage === STORAGE.sessionStorage) {
        window.location.href = logoutCallback;
    } else {
        return Promise.resolve(logoutCallback);
    }
}

/**
 * Handle sign out requests
 *
 * @param {object} requestParams
 * @param {function} callback
 * @returns {Promise<any>} sign out status
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function handleSignOut(storage: STORAGE.sessionStorage): Promise<any>;
export function handleSignOut(storage: STORAGE.webWorker, session: SessionData): Promise<any>;
export function handleSignOut(storage: STORAGE, session?: SessionData): Promise<any> {
    if (storage === STORAGE.sessionStorage && sessionStorage.length === 0) {
        return Promise.reject(new Error("No login sessions."));
    } else if (session.size === 0) {
        return Promise.reject(new Error("No login sessions."));
    } else {
        return sendSignOutRequest(storage, session);
    }
}
