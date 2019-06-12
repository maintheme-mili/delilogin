import axios from 'axios'

// 封装request

function request ({ methods, url, data = {}, header = {}, isAuth = true }) {
  return new Promise((resolve, reject) => {
    let options = {
      methods: methods,
      url: url,
      headers: {
        client_id: 'eplus_web',
        ...header
      }
    }
    axios(options)
      .then(res => {
        resolve(res)
      })
      .catch(error => {
        reject(error)
      })
  })
}

export function post (url, data, header, isAuth) {
  return request({
    methods: 'post',
    url,
    data,
    header,
    isAuth
  })
}

export const getLoginQrcodeUrl = data => post('/gateway/v2.0/qr/generatorLoginCode', data, { 'X-Service-Id': 'qr' })
