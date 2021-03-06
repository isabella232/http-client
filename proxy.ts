export function getProxyUrl(reqUrl: URL): URL | undefined {
  let usingSsl = reqUrl.protocol === 'https:'

  let proxyUrl: URL
  if (checkBypass(reqUrl)) {
    return proxyUrl
  }

  let proxyVar: string
  if (usingSsl) {
    proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY']
  } else {
    proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY']
  }

  if (proxyVar) {
    proxyUrl = new URL(proxyVar)
  }

  return proxyUrl
}

export function checkBypass(reqUrl: URL): boolean {
  if (!reqUrl.hostname) {
    return false
  }

  let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || ''
  if (!noProxy) {
    return false
  }

  // Determine the request port
  let reqPort: number
  if (reqUrl.port) {
    reqPort = Number(reqUrl.port)
  } else if (reqUrl.protocol === 'http:') {
    reqPort = 80
  } else if (reqUrl.protocol === 'https:') {
    reqPort = 443
  }

  // Format the request hostname and hostname with port
  let upperReqHosts = [reqUrl.hostname.toUpperCase()]
  if (typeof reqPort === 'number') {
    upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`)
  }

  // Compare request host against noproxy
  for (let upperNoProxyItem of noProxy
    .split(',')
    .map(x => x.trim().toUpperCase())
    .filter(x => x)) {
    if (upperReqHosts.some(x => x === upperNoProxyItem)) {
      return true
    }
  }

  return false
}
