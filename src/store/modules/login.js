export default {
  namespaced: true,
  state: {
    isScanning: false
  },

  mutations: {
    UPDATE_SCAN_STATE (state, value) {
      state.isScanning = value
    }
  }
}
