import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import * as types from './mutation-types';
import * as popupMessages from '../popup/utils/popup-messages';
import {convertToAE} from '../popup/utils/helper';
export default {
  setAccount({ commit }, payload) {
    commit(types.UPDATE_ACCOUNT, payload);
    commit(types.UPDATE_BALANCE);
  },
  setSubAccount({ commit }, payload) {
    commit(types.SET_SUBACCOUNT, payload);
  },
  setSubAccounts({ commit }, payload) {
    commit(types.SET_SUBACCOUNTS, payload);
  },
  switchNetwork({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit(types.SWITCH_NETWORK, payload);
      resolve();
    });
  },
  updateBalance({ commit, state }) {
    // get balance based on new or already fetched api
    state.aeAPI.then(ae => {
      ae.balance(state.account.publicKey)
        .then(balance => {
          commit(types.UPDATE_BALANCE, convertToAE(balance) );
        })
        .catch(e => {
          console.log(e);
          commit(types.UPDATE_BALANCE, convertToAE(0) );
        });
    });
  },
  updateBalanceSubaccounts({ commit, state }) {
    state.aeAPI.then(ae => {
      state.subaccounts.forEach((sub,index) => {
          ae.balance(sub.publicKey)
          .then(balance => {
            commit(types.UPDATE_SUBACCOUNTS_BALANCE, { account:index, balance: convertToAE(balance) } );
          })
          .catch(e => {
            commit(types.UPDATE_SUBACCOUNTS_BALANCE, { account:index, balance:  convertToAE(0) } );
          });
      });
    });
  },
  popupAlert({ commit }, payload) {
    switch (payload.name) {
      case 'spend':
        switch (payload.type) {
          case 'insufficient_balance':
            commit(types.SHOW_POPUP,{show:true,...popupMessages.INSUFFICIENT_BALANCE});
            break;
          case 'success_transfer':
            commit(types.SHOW_POPUP,{show:true,secondBtn:true,secondBtnClick:'showTransaction',...popupMessages.SUCCESS_TRANSFER,msg:payload.msg,data:payload.data})
            break;
          case 'incorrect_address':
                commit(types.SHOW_POPUP,{show:true,...popupMessages.INCORRECT_ADDRESS});
            break;
          case 'incorrect_amount':
                commit(types.SHOW_POPUP,{show:true,...popupMessages.INCORRECT_AMOUNT});
            break;
          case 'transaction_failed':
                commit(types.SHOW_POPUP,{show:true,...popupMessages.TRANSACTION_FAILED});
            break;
          default:
            break;
        }
        break;
      case 'account':
        switch (payload.type) {
          case 'publicKeyCopied':
            commit(types.SHOW_POPUP,{show:true,...popupMessages.PUBLIC_KEY_COPIED});
            break;
          case 'seedFastCopy':
              commit(types.SHOW_POPUP,{show:true,...popupMessages.SEED_FAST_COPY});
            break;
            case 'requiredField':
                commit(types.SHOW_POPUP,{show:true,...popupMessages.REQUIRED_FIELD});
              break;
            case 'added_success':
                commit(types.SHOW_POPUP,{show:true,...popupMessages.SUCCESS_ADDED});
              break;
            SUCCESS_ADDED
          default:
            break;
        }
        break;
      default:
        break;
    }
  },
  getTransactionsByPublicKey({commit,state}, payload) {
    const middlewareUrl = state.network[state.current.network].middlewareUrl;
    let limit = "",page = "" ,param = "";
    let account = payload.publicKey;
    if(payload.limit) {
      limit = "?limit=" + payload.limit;
    }
    if(payload.page) {
      page = "&page=" + payload.page;
    }
    if(payload.param) {
      param = "/" + payload.param;
    }
    return fetch(middlewareUrl + "/middleware/transactions/account/" + account + limit + page + param, {
      method:'GET',
      mode:'cors'
    })
    .then(res => res.json() )
    .catch(err => err);
  },
  updateLatestTransactions({ commit }, payload) {
    commit(types.UPDATE_LATEST_TRANSACTIONS, payload);
  },
  updateAllTransactions({commit, state}, payload) {
    commit(types.UPDATE_ALL_TRANSACTIONS,payload);
  },
  setAccountName({ commit , state}, payload) {
    commit(types.SET_ACCOUNT_NAME, payload);
  }
};
