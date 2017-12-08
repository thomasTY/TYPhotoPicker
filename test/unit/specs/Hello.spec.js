import Vue from 'vue'
import Demo from '@/components/Demo'

describe('Demo.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Demo)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.demo').textContent)
      .to.equal('Welcome to Your Vue.js App')
  })
})
