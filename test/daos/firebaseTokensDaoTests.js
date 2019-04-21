const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

var FirebaseTokensDao = require('../../src/firebase/FirebaseTokensDao');

var models = require('../../src/database/sequelize');
var User = models.user;
var FirebaseToken = models.firebaseToken;
var { userCreateData } = require('../data/userData');

describe('"FirebaseTokensDao Tests"', () => {

    describe('Get tokens for users', () => {
        var user1;
        var user2;
        var user3;
        var result;

        before(async () => {
            user1 = await User.create(userCreateData());
            user2 = await User.create(userCreateData());
            user3 = await User.create(userCreateData());
            
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
});
