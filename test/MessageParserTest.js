const chai = require('chai');
const expect = chai.expect;

var messageParser = require('../src/helpers/MessageParser');

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
    });

});