setInterval(() => {
  chrome.storage.sync.get("data", ({ data: realdata }) => {
    realdata ??= {}
    const ls = new Proxy(realdata, {
      get(target, prop) {
        var data = Reflect.get(target, prop)
        return data
      },
      set(target, prop, val) {
        var data = Reflect.set(target, prop, val)
        chrome.storage.sync.set({ data: realdata })
        return data
      },
    })
    ls.domains ??= []
    globalThis.ls = ls
  })
}, 1000)
Object.assign(globalThis, console)
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    const matched =
      ls.domains
        .map((e) => e.replace(/^https?:\/\//, "").replace(/\/$/, ""))
        .includes(
          details.initiator
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "")
        ) || details.url.includes(details.initiator)
    if (!details.url.includes(details.initiator))
      console[matched ? "log" : "error"](
        "from",
        details.initiator,
        "requesting",
        details.url,
        details.responseHeaders
      )

    // .find(
    //   (e) => e.name.toLowerCase() == "access-control-allow-origin"
    // )
    if (!matched) return
    // console.log(
    //   details.initiator,
    //   details.url,
    //   "---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
    // )
    // console.table({ ...h })
    var h = {}
    for (var { name, value } of details.responseHeaders) {
      h[name.toLowerCase()] = value
    }
    // Object.assign(h, {
    //   //   "access-control-allow-credentials": "Content-Type",
    //   "access-control-allow-origin": details.initiator,
    //   "access-control-allow-methods": "*",
    //   "access-control-allow-headers": "*",
    //   // "access-control-allow-credentials": "true",
    //   // "cross-origin-resource-policy": "cross-origin",
    //   //   "x-frame-options": "cross-origin",
    // })
    delete h["x-xss-protection"]
    // delete h["vary"]
    // delete h["location"]
    delete h["x-frame-options"]
    delete h["cross-origin-opener-policy"]
    delete h["content-security-policy"]
    // delete h["content-security-policy-report-only"]
    // delete h["cross-origin-opener-policy-report-only"]
    delete h["report-to"]
    delete h["cross-origin-resource-policy"]
    // delete h["origin-trial"]
    // delete h["strict-transport-security"]
    // delete h["p3p"]
    // delete h["cross-origin-opener-policy"]
    // delete h["strict-transport-security"]
    // delete h["content-security-policy"]
    // delete h["origin-trial"]

    // console.table({ ...h })

    details.responseHeaders = []
    for (var [key, value] of Object.entries(h)) {
      details.responseHeaders.push({
        name: key,
        value,
      })
    }
    if (!details.url.includes(details.initiator))
      log("CHANGED TO: ", details.responseHeaders)
    return {
      responseHeaders: details.responseHeaders,
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"]
)
