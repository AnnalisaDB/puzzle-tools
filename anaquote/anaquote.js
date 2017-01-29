Array.prototype.last = function () {
  return this[this.length - 1]
}
Array.prototype.remove = function (x) {
  let i = this.indexOf(x)
  if (i < 0) return this
  let copy = this.slice()
  copy.splice(i, 1)
  return copy
}
// Note: This only removes one instance of each element of array.
Array.prototype.subtract = function (array) {
  return array.reduce((remainder, x) => remainder.remove(x), this)
}
Array.prototype.sum = function () {
  return this.reduce((sum, i) => sum + i, 0)
}
Array.prototype.squeeze = function () {
  let s = []
  this.forEach((x, i) => {
    if (i === 0 || x !== s.last()) s.push(x)
  })
  return s
}
Array.prototype.flatMap = function (f) {
  return [].concat(...this.map(f))
}

String.prototype.replaceAt = function(i, str) {
  return this.slice(0, i) + str + this.slice(i + str.length)
}

Number.prototype.upTo = function (n) {
  return n < this ? [] : Array.from(Array(n - this + 1), (_, i) => this + i)
}
Object.defineProperty(Number.prototype, 'times', {
  get: function () { return (0).upTo(this - 1) }
})

class WordSet extends Set {
  constructor (words = []) {
    super(words)
    let prefixes = []
    words.forEach(word => {
      let len = word.length
      if (!prefixes[len]) prefixes[len] = new Set()
      for (let i = 0; i <= len; i++) prefixes[len].add(word.substr(0, i))
    })
    this.prefixes = prefixes
  }
  hasPrefix(prefix, wordLength) {
    return this.prefixes[wordLength] && this.prefixes[wordLength].has(prefix)
  }
}

class Enumeration {
  constructor (string) {
    this.string = string
    
    this.tokens = string.trim().split(/(\d+)/).map(token => {
      let len = Number.parseInt(token)
      return isNaN(len) ? token : len
    }).filter(s => s !== '')

    this.wordLengths = string.split(/\s+/).map(wordPattern => {
      let lengths = wordPattern.match(/\d+/g)
      return lengths === null ? false : lengths.map(s => Number.parseInt(s)).sum()
    }).filter(l => l)

    this.numWords = this.wordLengths.length

    let total = 0
    this.wordStarts = this.wordLengths.map(len => {
      let start = total
      total += len
      return start
    })

    this.blankString = this.tokens.map(token => {
      return typeof token === 'string' ? token : '_'.repeat(token)
    }).join('')

    this.trigramBlanks = this.blankString.match(/[^_]*_[^_]*_?[^_]*_?[^_]*/g)

    this.wordBlanks = this.blankString.match(/[^_]*_+[^\s]*\s*/g)

    this.trimmedWordBlanks = this.wordBlanks.map(blank => {
      blank = blank.replace(/\u2019/g, "'") // Allow smart-apostrophe, but our word list only has ASCII apostrophe.
      return blank.replace(/[^-_\/'A-Z0-9]/g, '')
    })
  }
  wordLength(i) {
    return this.wordLengths[i]
  }
  wordStart(i) {
    return this.wordStarts[i]
  }
  word(i, string) {
    return string.substr(this.wordStarts[i], this.wordLengths[i])
  }
  words(string) {
    return this.numWords.times.map(i => this.word(i, string))
  }
  trigramRangeForWord(i) {
    let start = this.wordStarts[i]
    let len = this.wordLengths[i]
    let startTrigram = Math.floor(start / 3)
    let endTrigram = Math.floor((start + len - 1) / 3)
    return [startTrigram, endTrigram]
  }
}

class Anaquote {
  constructor (trigrams, enumeration, wordSet = new WordSet()) {
   this.trigrams = trigrams.trim().toUpperCase().split(/\s+/)

    let leftover
    this.trigrams.forEach(t => {
      if (t.length > 3) throw new Error('Not a trigram: ' + t)
      else if (t.length < 3) {
        if (leftover) throw new Error(`More than one leftover: ${leftover} ${t}`)
        leftover = t
      }
    })

    this.trigrams = this.trigrams.sort((a, b) => {
      if (a.length !== b.length) return b.length - a.length // put leftover at the end
      return a.localeCompare(b)
    })

    this.selectedString = this.trigrams.map(t => t.length === 3 ? '???' : t).join('')

    if (enumeration) {
      this.enumeration = new Enumeration(enumeration)
      let enumerationTotal = this.enumeration.wordLengths.sum()
      let trigramsTotal = this.trigrams.join('').length
      if (enumerationTotal > trigramsTotal)
        throw new Error('Enumeration is too long!')
      else if (enumerationTotal < trigramsTotal)
        throw new Error('Enumeration is too short!')
    }

    this.wordSet = wordSet
  }

  get selectedString () { return this._selectedString }
  set selectedString (string) {
    this._selectedString = string
    this.selectedTrigrams.forEach((t, i) => {
      // Unselect partially-selected trigrams that now have no options.
      if (t !== '???' && t.includes('?') && this.availableTrigrams(i).length === 0)
        string = string.replaceAt(i*3, '???')
    })
    this._selectedString = string
  }

  get selectedTrigrams () {
    return this.selectedString.match(/..?.?/g)
  }
  selectedTrigram(i) {
    return this.selectedString.substr(i*3, 3)
  }
  selectTrigram(i, trigram) {
    this.selectedString = this.selectedString.replaceAt(i*3, trigram)
  }
  availableTrigrams(i) {
    let trigram = this.selectedTrigram(i)
    if (trigram.length < 3) return [trigram]
    let otherSelectedTrigrams = this.selectedTrigrams.remove(trigram)
    let avail = this.trigrams.subtract(otherSelectedTrigrams)
    if (trigram.includes('?')) {
      let regexp = new RegExp(trigram.replace(/\?/g, '.'))
      avail = avail.filter(t => regexp.test(t))
    }
    return avail
  }
  trigramOptions(i) {
    let trigram = this.selectedTrigram(i)
    if (trigram.length < 3) return [trigram]
    let opts = this.availableTrigrams(i)
    if (trigram.includes('?')) opts.unshift(trigram)
    return ['???', ...opts].squeeze()
  }

  get selectedWords () {
    return this.enumeration.words(this.selectedString)
  }
  selectedWord(i) {
    return this.enumeration.word(i, this.selectedString)
  }
  selectWord(i, word) {
    this.selectedString = this.selectedString.replaceAt(this.enumeration.wordStart(i), word)
    if (word.includes('?')) return
    // Auto-select unique trigrams that overlap the word.
    this.enumeration.trigramRangeForWord(i).forEach(i => {
      if (this.selectedTrigram(i).includes('?')) {
        let avail = this.availableTrigrams(i).squeeze()
        if (avail.length === 1) this.selectTrigram(i, avail[0])
      }
    })
  }
  unselectedWordOption(i) {
    let len = this.enumeration.wordLength(i)
    if (i === this.enumeration.numWords - 1) {
      // Don't unselect the leftover (the final non-trigram).
      let leftoverLength = this.selectedString.length % 3
      let leftover = this.selectedString.substr(-leftoverLength, leftoverLength)
      return '?'.repeat(len - leftoverLength) + leftover
    }
    return '?'.repeat(len)
  }
  // TODO: move this to Array? maybe named productWithoutRepeats or something??
  static permuteOptions(optionArrays, checkPrefix = x => true, selections = []) {
    if (!checkPrefix(selections)) return []
    if (optionArrays.length === 0) return [[]]
    let options = optionArrays[0].subtract(selections)
    let restOptionArrays = optionArrays.slice(1)
    return options.flatMap(selection => {
      let newSelections = [...selections, selection]
      let permutations = this.permuteOptions(restOptionArrays, checkPrefix, newSelections)
      return permutations.map(permutation => [selection, ...permutation])
    })
  }
  optionArraysForWord(i) {
    let word = this.selectedWord(i)
    let fullySelected = !word.includes('?')
    let selectedTrigrams = this.selectedTrigrams
    if (fullySelected) {
      // Act as if the word is unselected, to include all alternative word candidates.
      let string = this.selectedString.replaceAt(this.enumeration.wordStart(i), this.unselectedWordOption(i))
      selectedTrigrams = string.match(/..?.?/g)
    }
    let availableTrigrams = this.trigrams.subtract(selectedTrigrams)
    let [first, last] = this.enumeration.trigramRangeForWord(i)
    return first.upTo(last).map(i => {
      let trigram = selectedTrigrams[i]
      if (!trigram.includes('?')) return [trigram]
      let regexp = new RegExp(trigram.replace(/\?/g, '.'))
      return availableTrigrams.filter(t => regexp.test(t))
    })
  }
  wordCandidates(i) {
    let blank = this.enumeration.trimmedWordBlanks[i]
    let offset = this.enumeration.wordStart(i) % 3
    let len = this.selectedWord(i).length
    function permutationToWord(p) { return p.join('').substr(offset, len) }
    return this.constructor.permuteOptions(this.optionArraysForWord(i), perm => {
      let prefix = this.constructor.fillInBlankPrefix(blank, permutationToWord(perm))
      return this.wordSet.hasPrefix(prefix, blank.length)
    }).map(permutationToWord)
  }
  wordOptions(i) {
    return [this.unselectedWordOption(i), this.selectedWord(i), ...this.wordCandidates(i)].sort().squeeze()
  }

  static fillInBlank(blank, fill) {
    let letters = (fill + '???').split('')
    return blank.split('').map(b => b === '_' ? letters.shift() : b).join('')
  }
  static fillInBlankPrefix(blank, fill) {
    let letters = fill.split('')
    let filled = []
    for (let b of blank.split('')) {
      if (b !== '_') {
        filled.push(b)
      } else if (letters.length === 0) {
        break
      } else {
        filled.push(letters.shift())
      }
    }
    return filled.join('')
  }
  static formatOptions(options, blank) {
    return options.map(o => [o, this.fillInBlank(blank, o)])
  }
  formattedTrigramOptions(i) {
    if (!this.enumeration) return this.trigramOptions(i).map(o => [o, o])
    return this.constructor.formatOptions(this.trigramOptions(i), this.enumeration.trigramBlanks[i])
  }
  formattedWordOptions(i) {
    return this.constructor.formatOptions(this.wordOptions(i), this.enumeration.wordBlanks[i])
  }
  quotation() {
    if (!this.enumeration) return this.selectedString
    return this.constructor.fillInBlank(this.enumeration.blankString, this.selectedString)
  }
}

class SelectionView {
  constructor (model, i) {
    this.model = model
    this.i = i
    this.$el = $('<select>').addClass('mono')
    this.$el.change(() => { this.modelSelect(this.i, this.$el.val()) })
  }
  get $options () {
    return Array.from(this.$el.prop('options'))
  }
  render() {
    let opts = this.modelOptions(this.i).map(([v,t]) => {
      t = t.replace(/ /g, '&nbsp;')
      return `<option value=${v}>${t}</option>`
    })
    this.$el.empty().append(opts).val(this.modelValue(this.i))
    return this
  }
}

class SelectionsView {
  constructor (model) {
    this.model = model
    this.subviews = this.selections().map((s,i) => new this.subviewClass(model, i))
    this.$el = $('<p>').append(this.subviews.map(v => v.$el))
  }
  render() {
    this.subviews.forEach(v => v.render())    
    return this
  }
}

class TrigramSelectionView extends SelectionView {
  modelOptions(i) { return this.model.formattedTrigramOptions(i) }
  modelValue(i) { return this.model.selectedTrigram(i) }
  modelSelect(i, trigram) { this.model.selectTrigram(i, trigram) }
}

class WordSelectionView extends SelectionView {
  modelOptions(i) { return this.model.formattedWordOptions(i) }
  modelValue(i) { return this.model.selectedWord(i) }
  modelSelect(i, word) { this.model.selectWord(i, word) }
}

class TrigramsView extends SelectionsView {
  get subviewClass () { return TrigramSelectionView }
  selections() { return this.model.selectedTrigrams }
}

class WordsView extends SelectionsView {
  get subviewClass () { return WordSelectionView }
  selections() { return this.model.selectedWords }
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
  constructor (model) {
    this.$el = $('<div>')
    this.model = model
    this.quotation = new QuotationView(model)
    this.$el.append(this.quotation.$el)
    this.trigrams = new TrigramsView(model)
    this.$el.append(this.trigrams.$el)
    if (model.enumeration) {
      this.words = new WordsView(model)
      this.$el.append(this.words.$el)
    }
    this.$el.change(() => this.render())
  }
  render() {
    this.trigrams.render()
    if (this.words) this.words.render()
    this.quotation.render()
    return this
  }
}

class InputView {
  constructor (callback = () => { }) {
    let params = new URL(location).searchParams
    let trigrams = params.get('trigrams'), enumeration = params.get('enumeration')

    this.$start = $('<button>', { type: 'submit', text: 'Start' })

    this.$trigrams = $('<input>', {
      name: 'trigrams', placeholder: 'Trigrams', size: '100', val: trigrams
    })
    this.$trigrams.change(() => {
      this.$start.prop('disabled', !this.$trigrams.val())
    }).change()

    this.$enumeration = $('<input>', {
      name: 'enumeration', placeholder: 'Enumeration', size: '100', val: enumeration
    })

    this.$el = $('<form>').append(this.$trigrams, this.$enumeration, this.$start)
    this.$el.children().wrap('<div>') // to stack them vertically
    this.$el.submit(event => {
      event.preventDefault()
      if (this.$error) this.$error.remove()
      try { callback(this.$trigrams.val(), this.$enumeration.val()) }
      catch (e) {
        this.$error = $('<div>', { class: 'error', text: e.message })
        this.$el.append(this.$error)
        return
      }
      $(document.activeElement).blur()
    })
  }
}

class ApplicationView {
  constructor ($el) {
    this.$el = $el
    this.input = new InputView((trigrams, enumeration) => {
      if (this.anaquote) this.anaquote.$el.remove()
      this.anaquote = new AnaquoteView(new Anaquote(trigrams, enumeration, this.words)).render()
      this.$el.append(this.anaquote.$el)
    })
    this.$el.append(this.input.$el)
  }
  fetchWords() {
    $.get('../vendor/NPLCombinedWordList.txt', 'text/plain').done(data => {
      this.words = new WordSet(data.split(/\r?\n/).map(w => w.toUpperCase()))
      console.log('Fetched wordlist.')
    }).fail(data => {
      console.log('Failed to fetch wordlist:')
      console.log(data.statusText)
    })
  }
}
