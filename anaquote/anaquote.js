module.exports = {
  fillIn(enumeration, trigrams) {
    let text = trigrams.join('')
    return enumeration.split(/(\d+)/).map(token => {
      let len = Number.parseInt(token)
      if (isNaN(len)) return token
      let word = text.substr(0, len)
      text = text.substr(len)
      return word
    }).join('')
  }
}
