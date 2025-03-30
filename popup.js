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
  setInterval(() => {
    globalThis.ls = ls
  })
})
Object.assign(globalThis, console)
log(chrome)
onload = async () => {
  await waitforls()
  for (var dom of ls.domains) {
    createelem(document.body, "input", {
      value: dom,
      onchange: updateDomains,
    })
  }
  createelem(document.body, "input", {
    value: "",
    onchange: updateDomains,
  })
}
function updateDomains() {
  ls.domains = [...document.querySelectorAll("input")]
    .map((e) => e.value)
    .filter((e) => e)
  for (var e of document.querySelectorAll("input")) {
    if (!e.value) {
      return
    }
  }
  createelem(document.body, "input", {
    value: "",
    onchange: updateDomains,
  })
}

onclick = () => {}
function createelem(parent, elem, data = {}) {
  var type = elem
  var issvg =
    elem == "svg" || parent?.tagName?.toLowerCase?.() == "svg"
  elem = issvg
    ? document.createElementNS("http://www.w3.org/2000/svg", elem)
    : document.createElement(elem)
  if (data.class)
    data.class.split(" ").forEach((e) => {
      elem.classList.add(e)
    })
  if (data.options && type == "select")
    data.options = data.options.map((e) =>
      a.gettype(e, "array")
        ? a.createelem(elem, "option", {
            innerHTML: e[0],
            value: e[1],
          })
        : a.createelem(elem, "option", {
            innerHTML: e,
            value: e,
          })
    )
  if (type == "label" && "for" in data) {
    data.htmlFor = data.for
  }
  Object.assign(elem.style, data)
  if (type == "select") {
    a.foreach(data, function (a, s) {
      elem[a] = s
    })
  } else if (issvg) {
    Object.keys(data).forEach((e) => (elem[e] = data[e]))
  } else {
    Object.assign(elem, data)
  }
  if (parent !== null) {
    if (typeof parent == "string") parent = a.qs(parent)
    parent.appendChild(elem)
  }
  return elem
}

function waitforls() {
  return new Promise((resolve, reject) => {
    var int = setInterval(() => {
      if (globalThis.ls) {
        clearInterval(int)
        resolve()
      }
    })
  })
}
