const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var FirebaseTokensDao = require('../../src/firebase/FirebaseTokensDao');

var models = require('../../src/database/sequelize');
var TestDatabaseHelper = require('../TestDatabaseHelper');
var FirebaseToken = models.firebaseToken;


describe('"FirebaseTokensDao Tests"', () => {

    describe('Get tokens for users', () => {
        var user1;
        var user2;
        var user3;
        var result;

        before(async () => {
            user1 = await TestDatabaseHelper.createUser();
            user2 = await TestDatabaseHelper.createUser();
            user3 = await TestDatabaseHelper.createUser();
            
            await FirebaseToken.create({userId: user1.id, token: 'token1'});
            await FirebaseToken.create({userId: user2.id, token: 'token2'});
            await FirebaseToken.create({userId: user2.id, token: 'token3'});

            result = await FirebaseTokensDao.getForUsers([user1.username, user2.username, user3.username]);
        });

        it('should return three tokens', async () => {
            expect(result.length).to.eq(3);
        });

        it('user1 token must be returned', async () => {
            expect(result).to.include('token1');
        });

        it('user2 tokens must be returned', async () => {
            expect(result).to.include('token2');
            expect(result).to.include('token3');
        });
    });

    describe('Add token for user', () => {
        var user;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
            await FirebaseTokensDao.addToken(user.token, "mytoken12345");
        });

        it('user should have one token', async () => {
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens.length).to.eq(1);
        });

        it('user should have correct token', async () => {
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens[0]).to.have.property('token', "mytoken12345");
        });

        it('should not add same token to user', async () => {
            await FirebaseTokensDao.addToken(user.token, "mytoken12345");
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens.length).to.eq(1);
        });

        it('should add another token to user', async () => {
            await FirebaseTokensDao.addToken(user.token, "mytoken123456");
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens.length).to.eq(2);
            expect(userTokens[1]).to.have.property('token', "mytoken123456");
        });
    });

    describe('Remove token', () => {
        var user;

        before(async () => {
            user = await TestDatabaseHelper.createUser();
        });

        beforeEach(async () => {
            await FirebaseToken.create({userId: user.id, token: 'token1234567'});
        });

        it('user must not have tokens', async () => {
            await FirebaseTokensDao.removeToken('token1234567');
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens.length).to.eq(0);
        });

        it('should delete only specified token', async () => {
            await FirebaseToken.create({userId: user.id, token: 'token1234567890'});
            await FirebaseTokensDao.removeToken('token1234567');
            var userTokens = await user.getFirebaseTokens();
            expect(userTokens.length).to.eq(1);
            expect(userTokens[0]).to.have.property('token', 'token1234567890');
        });
    });
});
