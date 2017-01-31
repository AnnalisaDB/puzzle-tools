const { load, assert, refute, jsdom, sinon } = require('./test_helper')

load('anaquote/anaquote.js')

suite('Array utils')

test('last', () => {
  assert.equal(undefined, [].last())
  assert.equal(1, [1].last())
  assert.equal(3, [1, 2, 3].last())
})
test('remove', () => {
  let array = [1, 2, 3, 1]
  assert.equal([2, 3, 1], array.remove(1))
  assert.equal([1, 2, 3, 1], array)
  assert.same(array, array.remove(0))
})
test('subtract', () => {
  let array = [1, 2, 3, 1]
  assert.equal([3, 1], array.subtract([1, 2, 4]))
  assert.same(array, array.subtract([4, 5]))
})
test('sum', () => {
  assert.equal(0, [].sum())
  assert.equal(6, [1, 2, 3].sum())
  assert.equal(12, [1, 2, 3].sum(x => x * 2))
})
test('squeeze', () => {
  assert.equal([], [].squeeze())
  assert.equal([1], [1].squeeze())
  assert.equal([1, 2, 3], [1, 1, 2, 2, 3].squeeze())
  assert.equal([1, 2, 3, 1], [1, 2, 3, 1].squeeze())
})
test('flatMap', () => {
  assert.equal([2, 3, 4], [1, 2, 3].flatMap(x => x + 1))
  assert.equal([2, 3, 3, 4, 4, 5], [1, 2, 3].flatMap(x => [x + 1, x + 2]))
})
test('productWithoutRepeats', () => {
  assert.equal([[]], [].productWithoutRepeats())
  assert.equal([[1], [2]], [[1,2]].productWithoutRepeats())
  assert.equal([[1,2], [2,1]], [[1,2], [1,2]].productWithoutRepeats())
  assert.equal([[1,2,3], [1,2,4], [1,3,4],
                [2,3,1], [2,3,4],
                [3,2,1], [3,2,4],
                [4,2,1], [4,2,3], [4,3,1]], [[1,2,3,4], [2,3], [1,3,4]].productWithoutRepeats())
})
test('productWithoutRepeats with checkPrefix function', () => {
  function isSorted(array) { return array.length < 2 || array[0] <= array[1] && isSorted(array.slice(1)) }
  assert.equal([[1,2,3], [1,2,4], [1,3,4], [2,3,4]], [[1,2,3,4], [2,3], [1,3,4]].productWithoutRepeats(isSorted))
})

suite('String utils')

test('replaceAt', () => {
  let string = 'HELLO'
  assert.equal('YELLO', string.replaceAt(0, 'Y'))
  assert.equal('HEXXO', string.replaceAt(2, 'XX'))
  assert.equal('HELLZZ', string.replaceAt(4, 'ZZ'))
})

suite('Number utils')

test('upTo', () => {
  assert.equal([1, 2, 3], (1).upTo(3))
  assert.equal([], (3).upTo(1))
})
test('times', () => {
  assert.equal([0, 1, 2], (3).times)
  assert.equal([], (-3).times)
})

suite('WordSet')

test('is a Set', () => {
  let wordSet = new WordSet()
  assert.instanceOf(Set, wordSet)
})

test('hasPrefix', () => {
  let wordSet = new WordSet(['IT'])
  assert(wordSet.hasPrefix('IT', 2))
  assert(wordSet.hasPrefix('I', 2))
  assert(wordSet.hasPrefix('', 2))
  refute(wordSet.hasPrefix('T', 2))
  refute(wordSet.hasPrefix('I', 3))
  refute(wordSet.hasPrefix('I', 1))
})

suite('Blank')

test('toString', () => {
  assert.equal('foo', new Blank('foo'))
})

test('length', () => {
  assert.equal(3, new Blank('3').length)
  assert.equal(5, new Blank(' 5, ').length)
  assert.equal(4, new Blank("3'1").length)
  assert.equal(0, new Blank('...').length)
})

test('formattedLength', () => {
  assert.equal(3, new Blank('3').formattedLength)
  assert.equal(8, new Blank(' 5, ').formattedLength)
  assert.equal(5, new Blank("3'1").formattedLength)
  assert.equal(3, new Blank('...').formattedLength)
})

test('trigramBlanks', () => {
  assert.instanceOf(Blank, new Blank('3').trigramBlanks()[0])
  assert.equal(['3'], new Blank('3').trigramBlanks())
  assert.equal(['3', '2'], new Blank('5').trigramBlanks())
  assert.equal(['*3', '2'], new Blank('*5').trigramBlanks())
  assert.equal(['3', '2, 1', '3', '1!'], new Blank('5, 5!').trigramBlanks())
  assert.equal(['3!'], new Blank('3!').trigramBlanks())
  assert.equal(['3-', '3'], new Blank('3-3').trigramBlanks())
})

test('trim', () => {
  assert.instanceOf(Blank, new Blank('3').trim())
  assert.equal('5-2', new Blank('*5-2  ').trim())
  assert.equal('3/2', new Blank(' (3/2)').trim())
  assert.equal("1'4", new Blank("1'4").trim())
  assert.equal("'1'", new Blank("'1'").trim())
  assert.equal("3'1", new Blank('3’1').trim())
})

test('fillIn', () => {
  assert.equal('HELLO', new Blank('5').fillIn('HELLO'))
  assert.equal('(AND/OR)', new Blank('(3/2)').fillIn('ANDOR'))
})

test('fillIn with prefix', () => {
  let blank = new Blank('2-3')
  assert.equal('', blank.fillIn(''))
  assert.equal('A', blank.fillIn('A'))
  assert.equal('AD-', blank.fillIn('AD'))
  assert.equal('AD-H', blank.fillIn('ADH'))
  assert.equal('AD-HOC', blank.fillIn('ADHOC'))
})

test('formatOptions', () => {
  assert.equal([['HEL', 'HE L'], ['LOW', 'LO W']], new Blank('2 1').formatOptions(['HEL', 'LOW']))
})

suite('Enumeration')

test('toString', () => {
  assert.equal('5, 5!', new Enumeration('5, 5!'))
})

test('length', () => {
  assert.equal(9, new Enumeration("1 3'1 4.").length)
})

test('blank', () => {
  let enumeration = new Enumeration('5, 5!')
  assert.instanceOf(Blank, enumeration.blank)
  assert.equal('5, 5!', enumeration.blank)
})

test('trigramBlanks', () => {
  assert.instanceOf(Blank, new Enumeration('3').trigramBlanks[0])
  assert.equal(['3', '2, 1', '3', '1!'], new Enumeration('5, 5!').trigramBlanks)
})

test('wordBlanks', () => {
  let blanks = new Enumeration("  3'1  ...\t5 ").wordBlanks
  assert.instanceOf(Blank, blanks[0])
  assert.equal(["3'1  ", '...\t5'], blanks)
})

test('wordStart', () => {
  assert.equal(0, new Enumeration('5, 6!').wordStart(0))
  assert.equal(5, new Enumeration('5, 6!').wordStart(1))
  assert.equal(8, new Enumeration('5, 3, 6!').wordStart(2))
  assert.equal(5, new Enumeration("1 3'1 4.").wordStart(2))
})

suite('QuotationSelect')

test('toString', () => {
  assert.equal('???', new QuotationSelect('???'))
})

test('value', () => {
  assert.equal('???', new QuotationSelect('???').value)
})

test('trigrams', () => {
  assert.equal([], new QuotationSelect('', []).trigrams)
  assert.equal(['HOO', 'RAY'], new QuotationSelect('??????', ['HOO', 'RAY']).trigrams)
})

test('enumeration', () => {
  assert.equal(undefined, new QuotationSelect('??????', ['HOO', 'RAY']).enumeration)
  let e = new Enumeration('6')
  assert.same(e, new QuotationSelect('??????', ['HOO', 'RAY'], e).enumeration)
})

test('leftover', () => {
  assert.equal('', new QuotationSelect('YAY').leftover)
  assert.equal('LO', new QuotationSelect('HELLO').leftover)
})

test('trigramSelects', () => {
  let model = new QuotationSelect('HOORAY', ['HOO', 'RAY'])
  let selects = model.trigramSelects
  assert.equal(2, selects.length)
  assert.instanceOf(TrigramSelect, selects[0])
  assert.equal(['HOO', 'RAY'], selects[0].trigrams)
  assert.same(model, selects[0].quotationSelect)
  assert.equal(0, selects[0].i)
  assert.equal(3, selects[1].i)
  assert.equal(undefined, selects[0].blank)
})

test('trigramSelects with blanks', () => {
  let selects = new QuotationSelect('IAMFUN', ['FUN', 'IAM'], new Enumeration('1 2 3!')).trigramSelects
  assert.equal('1 2 ', selects[0].blank)
  assert.equal('3!', selects[1].blank)
})

test('setting value unselects partial trigrams that now have no available matches', () => {
  let model = new QuotationSelect('S?????', ['SEL', 'VES'])
  model.value = 'S??SEL'
  assert.equal('???SEL', model.value)
})

test('selectedTrigrams', () => {
  let model = new QuotationSelect('?????????D')
  assert.equal(['???', '???', '???'], model.selectedTrigrams)
  model.value = 'HELLOWORLD'
  assert.equal(['HEL', 'LOW', 'ORL'], model.selectedTrigrams)
})

suite('TrigramSelect')

test('trigrams', () => {
  assert.equal(['HEL', 'LOW', 'ORL'], new TrigramSelect(['HEL', 'LOW', 'ORL']).trigrams)
})

test('quotationSelect', () => {
  let q = new QuotationSelect('YAY')
  assert.same(q, new TrigramSelect([], q).quotationSelect)
})

test('i', () => {
  assert.equal(42, new TrigramSelect([], null, 42).i)
})

test('blank', () => {
  assert.equal(undefined, new TrigramSelect([], null, 0).blank)
  let b = new Blank('2 1')
  assert.same(b, new TrigramSelect([], null, 0, b).blank)
})

test('value', () => {
  assert.equal('LOW', new TrigramSelect([], new QuotationSelect('HELLOWORLD'), 3).value)
})

test('select', () => {
  let q = new QuotationSelect('HEL???ORLD')
  let model = new TrigramSelect([], q, 3)
  model.select('LOW')
  assert.equal('HELLOWORLD', q.value)
})

test('available', () => {
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], new QuotationSelect('?????????D'), 3)
  assert.equal(['HEL', 'LOW', 'ORL'], model.available())
})

test('available when selected', () => {
  let q = new QuotationSelect('LOW??????D')
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 0)
  let otherModel = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 3)
  assert.equal(['HEL', 'LOW', 'ORL'], model.available())
  assert.equal(['HEL', 'ORL'], otherModel.available())
})

test('available filters if partially selected', () => {
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], new QuotationSelect('HELLOWORLD'), 3)
  model.select('L??')
  assert.equal(['LOW'], model.available())
})

test('available includes duplicates', () => {
  let q = new QuotationSelect('?????????')
  let model = new TrigramSelect(['FLY', 'TSE', 'TSE'], q, 6)
  assert.equal(['FLY', 'TSE', 'TSE'], model.available())
  q.value = 'TSE??????'
  assert.equal(['FLY', 'TSE'], model.available())
  q.value = 'TSETSE???'
  assert.equal(['FLY'], model.available())
})

test('options', () => {
  let q = new QuotationSelect('?????????D')
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 0)
  assert.equal(['???', 'HEL', 'LOW', 'ORL'], model.options())
})

test('options includes unselection and partial selection when trigram is partially selected', () => {
  let q = new QuotationSelect('???L?????D')
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 3)
  assert.equal(['???', 'L??', 'LOW'], model.options())
})

test('options omits duplicates', () => {
  let q = new QuotationSelect('?????????')
  let model = new TrigramSelect(['FLY', 'TSE', 'TSE'], q, 0)
  assert.equal(['???', 'FLY', 'TSE'], model.options())
})

test('formattedOptions', () => {
  let q = new QuotationSelect('?????????D')
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 3, new Blank('2 1'))
  assert.equal([['???', '?? ?'], ['HEL', 'HE L'], ['LOW', 'LO W'], ['ORL', 'OR L']], model.formattedOptions())
})

test('formattedOptions with no blank', () => {
  let q = new QuotationSelect('?????????D')
  let model = new TrigramSelect(['HEL', 'LOW', 'ORL'], q, 3)
  assert.equal([['???', '???'], ['HEL', 'HEL'], ['LOW', 'LOW'], ['ORL', 'ORL']], model.formattedOptions())
})

suite('LeftoverSelect')

test('value', () => {
  assert.equal('D', new LeftoverSelect('D').value)
})

test('available', () => {
  assert.equal(['D'], new LeftoverSelect('D').available())
})

test('options', () => {
  assert.equal(['D'], new LeftoverSelect('D').options())
})

test('formattedOptions', () => {
  assert.equal([['D', 'D']], new LeftoverSelect('D').formattedOptions())
})

suite('WordSelect')

test('quotationSelect', () => {
  let q = new QuotationSelect('??????')
  assert.same(q, new WordSelect(q, 42, new Blank('17')).quotationSelect)
})

test('offset', () => {
  assert.equal(42, new WordSelect(null, 42, new Blank('17')).offset)
})

test('blank', () => {
  let blank = new Blank("3'1")
  assert.same(blank, new WordSelect(null, 0, blank).blank)
})

test('length', () => {
  assert.equal(17, new WordSelect(null, 42, new Blank('17')).length)
})

test('trimmedBlank', () => {
  let blank = new WordSelect(null, 0, new Blank('(3’1)')).trimmedBlank
  assert.instanceOf(Blank, blank)
  assert.equal("3'1", blank)
})

test('wordSet', () => {
  let wordSet = new WordSet(['HELLO'])
  assert.same(wordSet, new WordSelect(null, 0, new Blank('3'), wordSet).wordSet)
})

test('value', () => {
  let q = new QuotationSelect('??????E')
  assert.equal('????', new WordSelect(q, 0, new Blank('4')).value)
  assert.equal('??E', new WordSelect(q, 4, new Blank('3')).value)
})

test('select', () => {
  let q = new QuotationSelect('???LO')
  let model = new WordSelect(q, 0, new Blank('5'))
  model.select('HELLO')
  assert.equal('HELLO', q.value)
})

test('select partially selects trigrams on the border that have multiple candidates', () => {
  let q = new QuotationSelect('???????????????', ['HEL', 'LOW', 'ORL', 'DWI', 'DOW'])
  let model = new WordSelect(q, 5, new Blank('5'))
  model.select('WORLD')
  assert.equal('?????WORLD?????', q.value)
})

test('select fully selects partial trigrams if they have only one unique candidate', () => {
  let q = new QuotationSelect('?????????????????????', ['HEL', 'LOW', 'ORL', 'DGR', 'OUN', 'DGR', 'UEL'])
  let model = new WordSelect(q, 5, new Blank('5'))
  model.select('WORLD')
  assert.equal('???LOWORLDGR?????????', q.value)
})

test('select does not fully select partial trigrams if unselecting', () => {
  let q = new QuotationSelect('???LOW???D', ['HEL', 'LOW', 'ORL'])
  let model = new WordSelect(q, 0, new Blank('5'))
  model.select('?????')
  assert.equal('?????W???D', q.value)
})

test('unselectOption', () => {
  let q = new QuotationSelect('SELVES')
  assert.equal('??????', new WordSelect(q, 0, new Blank('6')).unselectOption())
})

test('unselectOption includes the leftover', () => {
  let q = new QuotationSelect('HELLOWORLD')
  assert.equal('????D', new WordSelect(q, 5, new Blank('5')).unselectOption())
})

test('trigramRange', () => {
  assert.equal([0, 0], new WordSelect(null, 0, new Blank('3')).trigramRange())
  assert.equal([1, 1], new WordSelect(null, 3, new Blank('3')).trigramRange())
  assert.equal([0, 1], new WordSelect(null, 0, new Blank('6')).trigramRange())
  assert.equal([0, 2], new WordSelect(null, 0, new Blank('7')).trigramRange())
  assert.equal([1, 2], new WordSelect(null, 3, new Blank('5')).trigramRange())
  assert.equal([0, 2], new WordSelect(null, 2, new Blank('5')).trigramRange())
})

test('trigramOptionArrays includes trigrams for each slot in word range', () => {
  let q = new QuotationSelect('????????????', ['LAY', 'OFF', 'OUT', 'SET'])
  let model = new WordSelect(q, 0, new Blank('6'))
  assert.equal([['LAY', 'OFF', 'OUT', 'SET'], ['LAY', 'OFF', 'OUT', 'SET']], model.trigramOptionArrays())
})

test('trigramOptionArrays excludes trigrams selected elsewhere', () => {
  let q = new QuotationSelect('??????LAY???', ['LAY', 'OFF', 'OUT', 'SET'])
  let model = new WordSelect(q, 0, new Blank('6'))
  assert.equal([['OFF', 'OUT', 'SET'], ['OFF', 'OUT', 'SET']], model.trigramOptionArrays())
})

test('trigramOptionArrays only includes selected trigrams in word range', () => {
  let q = new QuotationSelect('LAY?????????', ['LAY', 'OFF', 'OUT', 'SET'])
  let model = new WordSelect(q, 0, new Blank('6'))
  assert.equal([['LAY'], ['OFF', 'OUT', 'SET']], model.trigramOptionArrays())
})

test('trigramOptionArrays filters partially-selected trigrams', () => {
  let q = new QuotationSelect('A????????', ['ADG', 'AGL', 'IRL'])
  let model = new WordSelect(q, 1, new Blank('4'))
  assert.equal([['ADG', 'AGL'], ['ADG', 'AGL', 'IRL']], model.trigramOptionArrays())
})

test('trigramOptionArrays includes all unselected-elsewhere trigrams when word is fully selected', () => {
  let q = new QuotationSelect('LAYOFFOUT???', ['LAY', 'OFF', 'OUT', 'SET'])
  let model = new WordSelect(q, 0, new Blank('6'))
  assert.equal([['LAY', 'OFF', 'SET'], ['LAY', 'OFF', 'SET']], model.trigramOptionArrays())
})

test('trigramOptionArrays includes the leftover', () => {
  let q = new QuotationSelect('??????D', ['FUN', 'WAR'])
  let model = new WordSelect(q, 3, new Blank('4'))
  assert.equal([['FUN', 'WAR'], ['D']], model.trigramOptionArrays())
})

test('candidates permutes options, prunes non-prefixes, and returns words', () => {
  let q = new QuotationSelect('LAYOFFOUT???', ['LAY', 'OFF', 'OUT', 'SET'])
  let model = new WordSelect(q, 0, new Blank('6'), new WordSet(['LAYOFF', 'OFFLAY', 'OFFSET', 'SETOFF']))
  assert.equal(['LAYOFF', 'OFFLAY', 'OFFSET', 'SETOFF'], model.candidates())
})

test('candidates selects the proper substrings', () => {
  let q = new QuotationSelect('??????', ['DIT', 'IDI'])
  let model = new WordSelect(q, 1, new Blank('3'), new WordSet(['ITI', 'DID']))
  assert.equal(['ITI', 'DID'], model.candidates())
})

test('candidates includes apostrophes, hyphens, and slashes when looking up words', () => {
  let wordSet = new WordSet(['AND/OR', "CAN'T", 'CATCH-22', "L'OEIL", 'RANT'])
  let q = new QuotationSelect('?????????????????????', ['CAT', 'CH2', '2AN', 'DOR', 'LOE', 'ILC', 'ANT'])
  assert.equal(['CATCH22'], new WordSelect(q, 0, new Blank('5-2'), wordSet).candidates())
  assert.equal(['ANDOR'], new WordSelect(q, 7, new Blank('(3/2)'), wordSet).candidates())
  assert.equal(['LOEIL',], new WordSelect(q, 12, new Blank("1'4"), wordSet).candidates())
  assert.equal(['CANT'], new WordSelect(q, 17, new Blank('3’1'), wordSet).candidates())
})

test('options filters through wordSet and includes an unselection option', () => {
  let q = new QuotationSelect('??????', ['LAY', 'OFF', 'OUT', 'SET'])
  let words = ['LAYOFF', 'LAYOUT', 'OFFSET', 'OUTLAY', 'OUTSET', 'SETOFF', 'SETOUT']
  let model = new WordSelect(q, 0, new Blank('6'), new WordSet(words))
  assert.equal(['??????', ...words], model.options())
})

test('options includes partially selected word', () => {
  let q = new QuotationSelect('???LOW???D', ['HEL', 'LOW', 'ORL'])
  let wordSet = new WordSet(['HELLO', 'HELOR', 'WORLD', 'WHELD', 'LLOWD'])
  assert.equal(['?????', '???LO', 'HELLO'], new WordSelect(q, 0, new Blank('5'), wordSet).options())
  assert.equal(['????D', 'W???D', 'WHELD', 'WORLD'], new WordSelect(q, 5, new Blank('5'), wordSet).options())
})

test('options includes an unselection option when a word is fully selected', () => {
  let q = new QuotationSelect('?????WORLD', ['HEL', 'LOW', 'ORL'])
  assert.equal(['????D', 'WORLD'], new WordSelect(q, 5, new Blank('5'), new WordSet(['WORLD'])).options())
})

test('options includes current word even if not in the wordSet', () => {
  let q = new QuotationSelect('VESSEL', ['SEL', 'VES'])
  let model = new WordSelect(q, 0, new Blank('6'), new WordSet(['SELVES']))
  assert.equal(['??????', 'SELVES', 'VESSEL'], model.options())
})

test('options is sorted', () => {
  let q = new QuotationSelect('??????', ['AST', 'IFE'])
  let model = new WordSelect(q, 1, new Blank('5'), new WordSet(['A', 'FEAST', 'I', 'STIFE']))
  assert.equal(['?????', 'FEAST', 'STIFE'], model.options())
})

test('formattedWordOptions', () => {
  let q = new QuotationSelect('??????E', ['DBY', 'GOO'])
  let wordSet = new WordSet(['GOOD', 'DBYG', 'OOE', 'BYE'])
  let models = [new WordSelect(q, 0, new Blank('4 '), wordSet),
                new WordSelect(q, 4, new Blank('3!'), wordSet)]
  assert.equal([['????', '???? '], ['DBYG', 'DBYG '], ['GOOD', 'GOOD ']], models[0].formattedOptions())
  assert.equal([['??E', '??E!'],   ['BYE', 'BYE!'],   ['OOE', 'OOE!']],   models[1].formattedOptions())
})

suite('Anaquote')

test('error if total length of trigrams differs from enumeration', () => {
  let ex = assert.throws(Error, () => new Anaquote('HEL LOW ORL D', '5, 6!'))
  assert.equal('Enumeration is too long!', ex.message)

  ex = assert.throws(Error, () => new Anaquote('HEL LOW ORL D', '5, 4!'))
  assert.equal('Enumeration is too short!', ex.message)
})
test('error if trigrams are longer than 3', () => {
  let ex = assert.throws(Error, () => new Anaquote('HEL LOW ORLD'))
  assert.equal('Not a trigram: ORLD', ex.message)
})
test('error if more than one leftover', () => {
  let ex = assert.throws(Error, () => new Anaquote('HEL LOW OR LD'))
  assert.equal('More than one leftover: OR LD', ex.message)
})

test('trigrams is an array', () => {
  assert.equal(['HEL', 'LOW', 'ORL'], new Anaquote('HEL LOW ORL D').trigrams)
})
test('trigrams is uppercase', () => {
  assert.equal(['HEL', 'LOW', 'ORL'], new Anaquote('hel low orl d').trigrams)
})
test('trigrams is sorted', () => {
  assert.equal(['DBY', 'GOO'], new Anaquote('GOO DBY E').trigrams)
})
test('trigrams omits extra spaces', () => {
  assert.equal(['HEL', 'LOW', 'ORL'], new Anaquote(' HEL  LOW   ORL D  ').trigrams)
})

test('enumeration', () => {
  assert.equal('5 5!', new Anaquote('HEL LOW ORL D', '5 5!').enumeration)
  assert.equal(undefined, new Anaquote('EXT RAV AGA NZA').enumeration)
})

test('wordSet', () => {
  let model = new Anaquote('HEL LOW ORL D')
  assert.instanceOf(WordSet, model.wordSet)
  assert.equal(0, model.wordSet.size)

  let wordSet = new WordSet(['HELLO', 'WORLD'])
  model = new Anaquote('HEL LOW ORL D', '5 5!', wordSet)
  assert.same(wordSet, model.wordSet)
})

test('selectedString', () => {
  assert.equal('?????????D', new Anaquote('HEL LOW ORL D').selectedString)
})

test('quotationSelect', () => {
  let model = new Anaquote('HEL LOW ORL D')
  assert.instanceOf(QuotationSelect, model.quotationSelect)
  assert.equal('?????????D', model.quotationSelect.value)
  assert.equal(['HEL', 'LOW', 'ORL'], model.quotationSelect.trigrams)
  assert.equal(undefined, model.quotationSelect.enumeration)
})

test('quotationSelect with enumeration', () => {
  let model = new Anaquote('HEL LOW ORL D', '5, 5!')
  assert.same(model.enumeration, model.quotationSelect.enumeration)
})

test('trigramSelects', () => {
  let model = new Anaquote('HOO RAY')
  let selects = model.trigramSelects
  assert.equal(2, selects.length)
  assert.instanceOf(TrigramSelect, selects[0])
  assert.equal(['HOO', 'RAY'], selects[0].trigrams)
  assert.same(model.quotationSelect, selects[0].quotationSelect)
  assert.equal(0, selects[0].i)
})

test('trigramSelects includes LeftoverSelect', () => {
  let selects = new Anaquote('HEL LOW ORL D').trigramSelects
  assert.equal(4, selects.length)
  assert.instanceOf(LeftoverSelect, selects[3])
  assert.equal('D', selects[3].value)
})

test('wordSelects', () => {
  let model = new Anaquote('GOO DBY E', '4 3!', new WordSet(['GOOD', 'BYE']))
  let selects = model.wordSelects
  assert.equal(2, selects.length)
  assert.instanceOf(WordSelect, selects[0])
  assert.same(model.quotationSelect, selects[0].quotationSelect)
  assert.equal(0, selects[0].offset)
  assert.equal(4, selects[0].length)
  assert.equal(4, selects[1].offset)
  assert.equal(3, selects[1].length)
  assert.same(model.wordSet, selects[0].wordSet)
  assert.same(model.enumeration.wordBlanks[0], selects[0].blank)
})

test('selectedTrigrams', () => {
  let model = new Anaquote('HEL LOW ORL D')
  assert.equal(['???', '???', '???', 'D'], model.selectedTrigrams)
  model.quotationSelect.value = 'HELLOWORLD'
  assert.equal(['HEL', 'LOW', 'ORL', 'D'], model.selectedTrigrams)
})

test('selectedWords', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  assert.equal(['?????', '????D'], model.selectedWords)
  model.quotationSelect.value = 'HELLOWORLD'
  assert.equal(['HELLO', 'WORLD'], model.selectedWords)
})

test('selectedTrigram', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  assert.equal('???', model.selectedTrigram(0))
  assert.equal('D', model.selectedTrigram(3))
})

test('selectTrigram', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  model.selectTrigram(0, 'HEL')
  model.selectTrigram(2, 'ORL')
  assert.equal('HEL???ORLD', model.selectedString)
})

test('selectedWord', () => {
  let model = new Anaquote('GOO DBY E', '4 3!')
  assert.equal('????', model.selectedWord(0))
  assert.equal('??E', model.selectedWord(1))
})

test('selectWord partially selects trigrams on the border that have multiple candidates', () => {
  let model = new Anaquote('HEL LOW ORL DWI DOW', '5 5, 5.')
  model.selectWord(1, 'WORLD')
  assert.equal('?????WORLD?????', model.selectedString)
})

test('selectWord fully selects partial trigrams if they have only one unique candidate', () => {
  let model = new Anaquote('HEL LOW ORL DGR OUN DGR UEL', '5 5! 6 5.')
  model.selectWord(1, 'WORLD')
  assert.equal('???LOWORLDGR?????????', model.selectedString)
})

test('selectWord does not fully select partial trigrams if unselecting', () => {
  let model = new Anaquote('HEL LOW ORL D', '5, 5!')
  model.selectTrigram(1, 'LOW')
  model.selectWord(0, '?????')
  assert.equal('?????W???D', model.selectedString)
})

test('formattedTrigramOptions', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  assert.equal([['???', '?? ?'], ['HEL', 'HE L'], ['LOW', 'LO W'], ['ORL', 'OR L']],
               model.formattedTrigramOptions(1))
})

test('formattedTrigramOptions when enumeration is blank', () => {
  let model = new Anaquote('HEL LOW ORL D', '')
  assert.equal([['???', '???'], ['HEL', 'HEL'], ['LOW', 'LOW'], ['ORL', 'ORL']],
               model.formattedTrigramOptions(1))
})

test('formattedWordOptions', () => {
  let model = new Anaquote('GOO DBY E', '4 3!', new WordSet(['GOOD', 'DBYG', 'OOE', 'BYE']))
  assert.equal([['????', '???? '], ['DBYG', 'DBYG '], ['GOOD', 'GOOD ']], model.formattedWordOptions(0))
  assert.equal([['??E', '??E!'], ['BYE', 'BYE!'], ['OOE', 'OOE!']], model.formattedWordOptions(1))
})

test('quotation', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  assert.equal('????? ????D!', model.quotation())
  model.selectTrigram(0, 'HEL')
  model.selectTrigram(1, 'LOW')
  model.selectTrigram(2, 'ORL')
  assert.equal('HELLO WORLD!', model.quotation())
})

test('quotation when enumeration is blank', () => {
  let model = new Anaquote('HEL LOW ORL D', '')
  assert.equal('?????????D', model.quotation())
})

suite('SelectionView')

class TestSelectionView extends SelectionView {
  modelOptions(i) { return [['?', '?'], [`${i}`, `${i},  `]] }
  modelValue(i) { return this.value || `${i}` }
  modelSelect(i, value) { this.value = value }
}

test('constructor', () => {
  let model = new Anaquote('HEL LOW ORL D')
  let view = new TestSelectionView(model, 0)
  assert.same(model, view.model)
  assert.equal(0, view.i)
  assert.is('select', view.$el)
  assert.hasClass('mono', view.$el)
  assert.empty(view.$el.children())
})

test('$options', () => {
  let view = new TestSelectionView()
  assert.empty(view.$options)
  view.$el.append('<option>foo</option>', '<option>bar</option>')
  assert.equal(['foo', 'bar'], view.$options.map(o => o.value))
})

test('render', () => {
  let view = new TestSelectionView(new Anaquote('HEL LOW ORL D'), 0)
  assert.equal(view, view.render())
  assert.equal(['?', '0'], view.$options.map(o => o.value))
  assert.equal('0,&nbsp;&nbsp;', view.$options[1].text)
  assert.hasValue('0', view.$el)

  view.render()
  assert.equal(['?', '0'], view.$options.map(o => o.value))
})

test('selecting an option updates the model', () => {
  let view = new TestSelectionView(new Anaquote('HEL LOW ORL D'), 0)
  let $el = view.render().$el
  $el.val('?').change()
  assert.equal('?', view.modelValue(0))
})

suite('SelectionsView')

class TestSelectionsView extends SelectionsView {
  get subviewClass () { return TestSelectionView }
  selections() { return [0,1,2,3] }
}

test('constructor', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  let view = new TestSelectionsView(model)
  assert.is('p', view.$el)
  assert.same(model, view.model)
  assert.equal(4, view.subviews.length)

  let subview = view.subviews[0]
  assert.instanceOf(TestSelectionView, subview)
  assert.same(view.model, subview.model)
  assert.equal(0, subview.i)

  assert.equal(4, view.$el.children().length)
  assert.same(subview.$el[0], view.$el.children()[0])
})

test('render renders subviews', () => {
  let view = new TestSelectionsView(new Anaquote('HEL LOW ORL D', '5 5!'))
  assert.same(view, view.render())
  assert.equal('0', view.subviews[0].$options[1].value)
  assert.equal('1', view.subviews[1].$options[1].value)
})

suite('TrigramSelectionView')

test('extends SelectionView', () => {
  let view = new TrigramSelectionView(new Anaquote('HEL LOW ORL D', '5 5!'), 1)
  assert.instanceOf(SelectionView, view)
  assert.equal(view.model.formattedTrigramOptions(1), view.modelOptions(1))
  assert.equal('???', view.modelValue(1))
  view.modelSelect(1, 'HEL')
  assert.equal('HEL', view.modelValue(1))
})

suite('WordSelectionView')

test('extends SelectionView', () => {
  let view = new WordSelectionView(new Anaquote('HEL LOW ORL D', '5 5!', new WordSet(['HELLO'])), 0)
  assert.instanceOf(SelectionView, view)
  assert.equal(view.model.formattedWordOptions(1), view.modelOptions(1))
  assert.equal('?????', view.modelValue(0))
  view.modelSelect(0, 'HELLO')
  assert.equal('HELLO', view.modelValue(0))
})

suite('TrigramsView')

test('extends SelectionsView', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  let view = new TrigramsView(model)
  assert.instanceOf(SelectionsView, view)
  assert.same(TrigramSelectionView, view.subviewClass)
  assert.equal(model.selectedTrigrams, view.selections())
})

suite('WordsView')

test('extends SelectionsView', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  let view = new WordsView(model)
  assert.instanceOf(SelectionsView, view)
  assert.same(WordSelectionView, view.subviewClass)
  assert.equal(model.selectedWords, view.selections())
})

suite('QuotationView')

test('constructor', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  let view = new QuotationView(model)
  assert.same(model, view.model)
  assert.is('p', view.$el)
})

test('render', () => {
  let view = new QuotationView(new Anaquote('HEL LOW ORL D', '5 5!'))
  assert.same(view, view.render())
  assert.hasText(view.model.quotation(), view.$el)
})

suite('AnaquoteView')

test('constructor', () => {
  let model = new Anaquote('HEL LOW ORL D', '5 5!')
  let view = new AnaquoteView(model)
  assert.is('div', view.$el)
  assert.same(model, view.model)

  assert.instanceOf(QuotationView, view.quotation)
  assert.same(model, view.quotation.model)
  assert.same(view.quotation.$el[0], view.$el.children()[0])

  assert.instanceOf(TrigramsView, view.trigrams)
  assert.same(model, view.trigrams.model)
  assert.same(view.trigrams.$el[0], view.$el.children()[1])

  assert.instanceOf(WordsView, view.words)
  assert.same(model, view.words.model)
  assert.same(view.words.$el[0], view.$el.children()[2])
})

test('render', () => {
  let view = new AnaquoteView(new Anaquote('HEL LOW ORL D', '5 5!'))
  assert.same(view, view.render())
  refute.empty(view.trigrams.subviews[0].$options)
  refute.empty(view.words.subviews[0].$options)
  assert.hasText(view.model.quotation(), view.quotation.$el)
})

test('selecting an option re-renders', () => {
  let view = new AnaquoteView(new Anaquote('HEL LOW ORL D', '5 5!')).render()
  view.trigrams.subviews[1].$el.val('LOW').change()
  refute.includes(view.trigrams.subviews[0].$options.map(o => o.value), 'LOW')
  assert.hasText(view.model.quotation(), view.quotation.$el)
})

test('omits words view when enumeration is blank', () => {
  let view = new AnaquoteView(new Anaquote('EXT RAV AGA NZA'))
  assert.equal(undefined, view.words)
  assert.equal(2, view.$el.children().length)
  view.render()
})

suite('InputView')

test('constructor', () => {
  let url = window.location.href
  jsdom.changeURL(window, url + '?trigrams=HEL+LOW+ORL+D&enumeration=5+5!')
  let view = new InputView()
  jsdom.changeURL(window, url)
  assert.is('form', view.$el)
  let $children = view.$el.children('div')
  assert.equal(3, $children.length)
  assert.has(view.$trigrams, $children.eq(0))
  assert.has(view.$enumeration, $children.eq(1))
  assert.has(view.$start, $children.eq(2))

  assert.is('input[name=trigrams]', view.$trigrams)
  assert.hasAttr('placeholder', 'Trigrams', view.$trigrams)
  assert.hasAttr('size', '100', view.$trigrams)
  assert.hasValue('HEL LOW ORL D', view.$trigrams)

  assert.is('input[name=enumeration]', view.$enumeration)
  assert.hasAttr('placeholder', 'Enumeration', view.$enumeration)
  assert.hasAttr('size', '100', view.$enumeration)
  assert.hasValue('5 5!', view.$enumeration)

  assert.is('button[type=submit]', view.$start)
  assert.hasText('Start', view.$start)
  assert.hasProp('disabled', false, view.$start)
})

test('button is disabled if trigrams param is blank', () => {
  let view = new InputView()
  assert.hasProp('disabled', true, view.$start)
})

test('button is enabled/disabled when trigrams input changes', () => {
  let view = new InputView()
  view.$trigrams.val('X').change()
  assert.hasProp('disabled', false, view.$start)

  view.$trigrams.val('').change()
  assert.hasProp('disabled', true, view.$start)
})

test('submitting the form calls the callback with trigrams and enumeration', () => {
  let trigrams, enumeration
  let view = new InputView((t, e) => { trigrams = t; enumeration = e })
  view.$trigrams.val('HEL LOW ORL D')
  view.$enumeration.val('5 5!')
  view.$el.submit()
  assert.equal('HEL LOW ORL D', trigrams)
  assert.equal('5 5!', enumeration)
})

test('submit form causes blur', () => {
  let view = new InputView()
  view.$trigrams.val('HEL LOW ORL D')
  view.$enumeration.val('5 5!')
  view.$enumeration.focus()
  assert(document.hasFocus())
  view.$el.submit()
  refute(document.hasFocus())
})

test('error thrown by callback is displayed on the form', () => {
  let view = new InputView(() => { throw new Error('oops') })
  view.$enumeration.focus()
  view.$el.submit()
  assert(document.hasFocus())
  assert.hasClass('error', view.$error)
  assert.hasText('oops', view.$error)
  let $children = view.$el.children('div')
  assert.equal(4, $children.length)
  assert.same(view.$error[0], $children.eq(3)[0])
})

test('old error is replaced when new one is thrown', () => {
  let num = 0
  let view = new InputView(() => { throw new Error(`oops ${num++}`) })
  view.$el.submit()
  view.$el.submit()
  let $children = view.$el.children('div')
  assert.equal(4, $children.length)
  assert.hasText('oops 1', $children.eq(3))
})

test('old error is removed when no error is thrown', () => {
  let num = 0
  let view = new InputView(() => { if (num++ === 0) throw new Error('oops') })
  view.$el.submit()
  view.$el.submit()
  assert.equal(3, view.$el.children('div').length)
})

suite('ApplicationView')

test('constructor', () => {
  let $el = $('<div>')
  let view = new ApplicationView($el)
  assert.same($el, view.$el)
  assert.instanceOf(InputView, view.input)
  assert.same(view.input.$el[0], view.$el.children()[0])
})

test('clicking Start makes a new rendered AnaquoteView', () => {
  let view = new ApplicationView($('<div>'))
  view.input.$trigrams.val('HEL LOW ORL D').change()
  view.input.$enumeration.val('5 5!').change()
  view.input.$start.click()
  assert.instanceOf(AnaquoteView, view.anaquote)
  assert.equal(['HEL', 'LOW', 'ORL'], view.anaquote.model.trigrams)
  assert.equal('5 5!', view.anaquote.model.enumeration)
  assert.same(view.anaquote.$el[0], view.$el.children().last()[0])
  assert.hasText(view.anaquote.model.quotation(), view.anaquote.quotation.$el)
  assert.instanceOf(WordSet, view.anaquote.model.wordSet)

  view.words = new WordSet(['HELLO', 'WORLD'])
  view.input.$start.click()
  assert.same(view.words, view.anaquote.model.wordSet)
})

test('clicking Start removes the old AnaquoteView first', () => {
  let view = new ApplicationView($('<div>'))
  view.input.$trigrams.val('HEL LOW ORL D').change()
  view.input.$enumeration.val('5 5!').change()
  view.input.$start.click()
  assert.equal(2, view.$el.children().length)

  view.input.$start.click()
  assert.equal(2, view.$el.children().length)
})

// Can't get this to work :(
test.skip('fetchWords', () => {
  let server = sinon.fakeServer.create()

  let app = new ApplicationView($('<div>'))
  app.fetchWords()
  console.log(server)

  server.respond()
  refute.empty(server.requests)
  
  server.restore()
})

suite('performance')

before('load the word list', () => {
  const fs = require('fs')
  const wordList = fs.readFileSync(__dirname + '/../vendor/NPLCombinedWordList.txt', 'latin1')
  wordSet = new WordSet(wordList.split(/\r?\n/).map(w => w.toUpperCase()))
})

test('four long words', () => {
  let model = new Anaquote('AGA EXT ILO IZE NZA QUI RAV RDS RGA RIT SBO SMO SOL SPI UAL ZED', '12 12 12 12',
                           wordSet)
  assert.equal(['????????????', 'EXTRAVAGANZA', 'SMORGASBORDS', 'SOLILOQUIZED', 'SPIRITUALIZE'],
               model.wordSelects[0].options())
})
 
test('full sentence', () => {
  let trigrams =
      'ABA AND ARI BOO CPR DGE DNT DOF EDI ESS FIR GER HOL ISG ISH KBU ' +
      'LSE LYI NCL NEC NIE NME NTH PSH ROU STP TDI THE THO UBL UDE WAS'
  let enumeration = "3 6 7 6 2 3 3 5 9 2 4 5'1 8 (3 4'1 11 7 1 5)."
  let model = new Anaquote(trigrams, enumeration, wordSet)
  let view = new AnaquoteView(model).render()
})

