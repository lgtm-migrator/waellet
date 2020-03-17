import Vue from 'vue';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import Components from '@aeternity/aepp-components-3';
import routes from './routes';
import '@aeternity/aepp-components-3/dist/aepp.components.css';
import LoaderComponent from './components/Loader';
import TransactionItemComponent from './components/TransactionItem';
import SwitchButtonComponent from './components/SwitchButton';
import Popup from './components/Popup';
import AlertComponent from './components/Alert';
import AmountInput from './components/AmountInput';
import AddressInput from './components/AddressInput';
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader'
import ModalComponent from './components/Modal';
import NodeConnectionStatus from './components/NodeConnectionStatus'
import * as helper from '../utils/helper';
import store from '../../store';
import wallet from '../../lib/wallet'

const plugin = {
  install () {
      Vue.helpers = helper
      Vue.prototype.$helpers = helper
  }
}

Vue.use(plugin)
Vue.use(VueRouter);
Vue.use(VueClipboard);
Vue.use(Components);

Vue.component('Loader',LoaderComponent);
Vue.component('TransactionItem',TransactionItemComponent);
Vue.component('SwitchButton',SwitchButtonComponent);
Vue.component('Popup',Popup);
Vue.component('Alert', AlertComponent);
Vue.component('QrcodeStream',QrcodeStream);
Vue.component('QrcodeDropZone',QrcodeDropZone);
Vue.component('QrcodeCapture',QrcodeCapture);
Vue.component('Modal', ModalComponent);
Vue.component('AmountInput', AmountInput);
Vue.component("AddressInput", AddressInput);
Vue.component("NodeConnectionStatus", NodeConnectionStatus);

let router = new VueRouter({
  routes,
});

let isFirstTransition = true;
let lastRouteKey = 'lsroute'
const noRedirectUrls = [
  '/popup-sign-tx',
  '/connect',
  '/connect-confirm',
  '/sign-transaction/:type?',
  '/sign-transaction',
  '/ask-accounts',
  '/seed'
]

router.beforeEach((to, from, next) => {
  const lastRouteName = localStorage.getItem(lastRouteKey);
  const shouldRedirect = to.path === ("/" || "/account") && lastRouteName && isFirstTransition;
  if(to.path == '/seed') {
    return next()
  }
  if(store.getters.account.hasOwnProperty("publicKey") && store.getters.isLoggedIn) {
    if(!store.getters.sdk) {
      wallet.initSdk(() => next('/'))
    }
    next()
  } else {
    wallet.init((route) => {
      if(shouldRedirect && (route == '/' || route == '/account') && !noRedirectUrls.includes(lastRouteName)) {
        next(lastRouteName)
      } else {
        if(route) {
          next(route)
        } else {
          next()
        }
      }
    })
  }
  isFirstTransition = false
})

router.afterEach(to => {
  localStorage.setItem(lastRouteKey, to.path);
});

export default router;
