const chai = require('chai');
const expect = chai.expect;

var Validator = require('../../src/helpers/Validator');

describe('"Validator Tests"', () => {

    describe('Validate single word', () => {

        it('single word must be valid', async () => {
            var word = "word";
            expect(Validator.validateSingleWord(word)).to.be.true;
        });

        it('single word with numbers must be valid', async () => {
            var word = "word123";
            expect(Validator.validateSingleWord(word)).to.be.true;
        });

        it('two words must not be valid', async () => {
            var word = "two words";
            expect(Validator.validateSingleWord(word)).to.be.false;
        });

        it('multiple words must not be valid', async () => {
            var word = "this is a sentence";
            expect(Validator.validateSingleWord(word)).to.be.false;
        });

        it('empty word must not be valid', async () => {
            var word = "";
            expect(Validator.validateSingleWord(word)).to.be.false;
        });

        it('null word must not be valid', async () => {
            var word = null;
            expect(Validator.validateSingleWord(word)).to.be.false;
        });

        it('multiple line words must not be valid', async () => {
            var word = "word1\nword2";
            expect(Validator.validateSingleWord(word)).to.be.false;
        });
    });
});