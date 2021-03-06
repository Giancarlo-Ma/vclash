import Vue from 'vue'
import { Button, PageHeader, Menu, Icon, Layout, Card, List, Spin, FormModel, Radio, Input, Switch, InputNumber, message, Pagination, Checkbox, Alert, Row, Col, Select, Collapse } from 'ant-design-vue'

import App from './App.vue'
import store from './store'

Vue.use(Button).use(PageHeader).use(Menu).use(Icon).use(Layout).use(Card).use(List).use(Spin).use(FormModel).use(Radio).use(Input).use(Switch).use(InputNumber).use(Pagination).use(Checkbox).use(Alert).use(Row).use(Col).use(Select).use(Collapse)

Vue.prototype.$message = message;

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
