const chai = require('chai');
const expect = chai.expect;

var messageParser = require('../../src/helpers/MessageParser');
var Config = require('../../src/helpers/Config');

describe('"Message Parser Tests"', () => {

    describe('Get Mentioned Users', () => {

        it('must return empty array for empty message', async () => {
            var msg = "";
            expect(messageParser.getMentionedUsers(msg)).to.be.an('array').that.is.empty;
        });

        it('must return empty array for message without mentions', async () => {
            var msg = "Hello how are you? I am good";
            expect(messageParser.getMentionedUsers(msg)).to.be.an('array').that.is.empty;
        });

        it('must return one user name', async () => {
            var msg = "Hello @pepe how are you? I am good";
            var users = messageParser.getMentionedUsers(msg);
            expect(users).to.be.an('array').that.has.length(1);
        });

        it('must return mentioned user name', async () => {
            var msg = "Hello @pepe how are you? I am good";
            var users = messageParser.getMentionedUsers(msg);
            expect(users[0]).to.eq('pepe');
        });

        it('must return two user names', async () => {
            var msg = "Hello @pepe how are you? I am @jose";
            var users = messageParser.getMentionedUsers(msg);
            expect(users).to.be.an('array').that.has.length(2);
        });

        it('must return mentioned user names', async () => {
            var msg = "Hello @pepe how are you? I am @jose";
            var users = messageParser.getMentionedUsers(msg);
            expect(users[0]).to.eq('pepe');
            expect(users[1]).to.eq('jose');
        });

        it('must not return two users if not separated by spaces', async () => {
            var msg = "Hello @pepe@carlos how are you? I am good";
            var users = messageParser.getMentionedUsers(msg);
            expect(users).to.be.an('array').that.has.length(1);
        });

        it('must not return repeated user names', async () => {
            var msg = "Hello @pepe how are you? I am @pepe";
            var users = messageParser.getMentionedUsers(msg);
            expect(users).to.be.an('array').that.has.length(1);
        });

        it('must return empty array for message with @ without mentions', async () => {
            var msg = "Hello @ how are you? I am good";
            expect(messageParser.getMentionedUsers(msg)).to.be.an('array').that.is.empty;
        });

        it('must return empty array for message with @ inside a word', async () => {
            var msg = "Hello pepe@pepe how are you? I am good";
            expect(messageParser.getMentionedUsers(msg)).to.be.an('array').that.is.empty;
        });
    });

    describe('Replace forbidden words', () => {

        var forbidden = ['one', 'two', 'three', 'four'];
        var replace = Config.forbiddenWordsReplacement;

        it('empty message must be the same', async () => {
            var msg = "";
            expect(messageParser.replaceForbiddenWords(msg, forbidden)).to.eq(msg);
        });

        it('message without forbidden words must be the same', async () => {
            var msg = "this is a message without forbidden words";
            expect(messageParser.replaceForbiddenWords(msg, forbidden)).to.eq(msg);
        });

        it('one forbidden word must be replaced', async () => {
            var msg = "this is a message with one forbidden word";
            var expected = `this is a message with ${replace} forbidden word`;
            expect(messageParser.replaceForbiddenWords(msg, forbidden)).to.eq(expected);
        });

        it('two forbidden words must be replaced', async () => {
            var msg = "this is a message with one or two forbidden words";
            var expected = `this is a message with ${replace} or ${replace} forbidden words`;
            expect(messageParser.replaceForbiddenWords(msg, forbidden)).to.eq(expected);
        });

        it('forbidden words must be replaced every time', async () => {
            var msg = "one two three four five six one one one";
            var expected = `${replace} ${replace} ${replace} ${replace} five six ${replace} ${replace} ${replace}`;
            expect(messageParser.replaceForbiddenWords(msg, forbidden)).to.eq(expected);
        });
    });

});