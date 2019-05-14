const chai = require('chai');
const expect = chai.expect;

var Token = require('../../src/helpers/Token');

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

    describe('Username generation', () => {
        var email = "pepito";

        it('username must start with email name', async () => {
            var username = Token.generateRandomUsername(email);
            expect(username).to.have.string("pepito");
        });

        it('two usernames with same email must be different', async () => {
            var user1 = Token.generateRandomUsername(email);
            var user2 = Token.generateRandomUsername(email);
            expect(user1).to.not.be.eq(user2);
        });

        it('three usernames with same email must be different', async () => {
            var user1 = Token.generateRandomUsername(email);
            var user2 = Token.generateRandomUsername(email);
            var user3 = Token.generateRandomUsername(email);
            expect(user1).to.not.be.eq(user2);
            expect(user1).to.not.be.eq(user3);
            expect(user2).to.not.be.eq(user3);
        });
    });
});
