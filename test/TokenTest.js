const chai = require('chai');
const expect = chai.expect;

var Token = require('../src/helpers/Token');

describe('"Token Tests"', () => {

    describe('Token generation', () => {

        it('token must be a large string', async () => {
            var token = Token.generate();
            expect(token).to.be.a('string').that.has.length(20);
        });

        it('two tokens must be different', async () => {
            var token1 = Token.generate();
            var token2 = Token.generate();
            expect(token1).to.not.be.eq(token2);
        });

        it('three tokens must be different', async () => {
            var token1 = Token.generate();
            var token2 = Token.generate();
            var token3 = Token.generate();
            expect(token1).to.not.be.eq(token2);
            expect(token1).to.not.be.eq(token3);
            expect(token2).to.not.be.eq(token3);
        });

        it('50 tokens must be different', async () => {
            var token1 = Token.generate();
            for (i = 0; i < 50; i++) {
                expect(Token.generate()).to.not.be.eq(token1);
            }
        });

    });

});
