import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import Node from '@aeternity/aepp-sdk/es/node';
import { networks, DEFAULT_NETWORK } from './constants';
import { setContractInstance, contractCall, parseFromStorage } from './helper';

let sdk;
let controller;

export const setController = contr => {
  controller = contr;
};

export const getActiveAccount = () =>
  new Promise((resolve, rejet) => {
    browser.storage.local.get('isLogged').then(data => {
      if (data.isLogged && data.hasOwnProperty('isLogged')) {
        browser.storage.local.get('subaccounts').then(subaccounts => {
          browser.storage.local.get('activeAccount').then(active => {
            let activeIdx = 0;
            if (active.hasOwnProperty('activeAccount')) {
              activeIdx = active.activeAccount;
            }
            const address = subaccounts.subaccounts[activeIdx].publicKey;
            resolve({ account: { publicKey: address }, activeAccount: activeIdx });
          });
        });
      } else {
        resolve(false);
      }
    });
  });

export const getActiveNetwork = async () => {
  const { activeNetwork } = await browser.storage.local.get('activeNetwork');
  return networks[activeNetwork || DEFAULT_NETWORK];
};

export const getSDK = async (keypair = {}) => {
  if (!sdk) {
    try {
      const network = await getActiveNetwork();
      const node = await Node({ url: network.internalUrl, internalUrl: network.internalUrl });
      sdk = await Universal({
        nodes: [{ name: DEFAULT_NETWORK, instance: node }],
        networkId: network.networkId,
        nativeMode: true,
        compilerUrl: network.compilerUrl,
      });
    } catch (e) {}
  }

  return sdk;
};

export const contractCallStatic = async ({ tx, callType }) =>
  new Promise(async (resolve, reject) => {
    try {
      const { activeAccount, account } = await getActiveAccount();
      if (controller.isLoggedIn() && typeof callType !== 'undefined' && callType == 'static') {
        const keypair = parseFromStorage(await controller.getKeypair({ activeAccount, account }));
        const sdk = await getSDK(keypair);
        const contractInstance = await setContractInstance(tx, sdk, tx.address);
        const call = await contractCall({ instance: contractInstance, method: tx.method, params: [...tx.params, tx.options] });
        if (call) {
          resolve(call);
        } else {
          reject('Contract call failed');
        }
      } else if (!controller.isLoggedIn() && typeof callType !== 'undefined' && callType == 'static') {
        reject('You need to unlock the wallet first');
      }
    } catch (e) {
      reject(e);
    }
  });
