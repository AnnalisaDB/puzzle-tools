class Anaquote {
  constructor (trigrams, enumeration = '') {
    this.trigrams = trigrams.split(' ')
    this.selections = this.trigrams.map(t => '???')
    this.enumeration = enumeration
    this.blanks = this.constructor.makeBlanks(this.enumeration)
  }
  options(i) {
    let otherSelections = new Set(this.selections)
    otherSelections.delete(this.selection(i))
    return ['???', ...this.trigrams.filter(t => !otherSelections.has(t))]
  }
  selection(i) {
    return this.selections[i]
  }
  select(i, trigram) {
    this.selections[i] = trigram
  }
  static makeBlanks(enumeration) {
    // TODO: there's gotta be a better way to do this...
    let blanks = []
    let blank = ''
    let i = 0
    enumeration.split(/(\d+)/).forEach(token => {
      let len = Number.parseInt(token)
      if (isNaN(len)) {
        blank += token
      } else {
        for (let j = 0; j < len; j++) {
          if (i === 3) {
            blanks.push(blank)
            blank = ''
            i = 0
          }
          blank += '?'
          i++
        }
      }
    })
    if (blank.length > 0) blanks.push(blank)
    return blanks
  }
  fillInBlank(i, trigram) {
    let letters = (trigram + '???').split('')
    return this.blanks[i].split('').map(blank => blank === '?' ? letters.shift() : blank).join('')
  }
  formattedOptions(i) {
    return this.options(i).map(o => [o, this.fillInBlank(i, o)])
  }
  quotation() {
    return this.selections.map((t, i) => this.fillInBlank(i, t)).join('')
  }
}

class TrigramSelectionView {
  constructor (model, i) {
    this.model = model
    this.i = i
    this.$el = $('<select>').addClass('mono')
    this.$el.change(() => { this.model.select(this.i, this.$el.val()) })
  }
  get $options () {
    return Array.from(this.$el.prop('options'))
  }
  render() {
    let opts = this.model.formattedOptions(this.i).map(([v,t]) => {
      t = t.replace(/ /g, '&nbsp;')
      return `<option value=${v}>${t}</option>`
    })
    this.$el.empty().append(opts).val(this.model.selection(this.i))
    return this
  }
}

class TrigramsView {
  constructor (el, model) {
    this.$el = $(el)
    this.model = model
    this.subviews = this.model.selections.map((t,i) => new TrigramSelectionView(this.model, i))
    this.$el.empty().append(this.subviews.map(v => v.$el))
  }
  render() {
    this.subviews.forEach(v => v.render())
    return this
  }
}

class QuotationView {
  constructor (model) {
    this.model = model
    this.$el = $('<p>')
  }
  render() {
    this.$el.text(this.model.quotation())
    return this
  }
}

class AnaquoteView {
  constructor (el, model) {
    this.$el = $(el)
    this.model = model
    this.trigrams = new TrigramsView('<p>', model)
    this.$el.append(this.trigrams.$el)
    this.quotation = new QuotationView(model)
    this.$el.append(this.quotation.$el)
    this.$el.change(() => this.render())
  }
  render() {
    this.trigrams.render()
    this.quotation.render()
    return this
  }
}
