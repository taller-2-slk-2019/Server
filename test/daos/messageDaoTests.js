const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var MessageDao = require('../../src/daos/MessageDao');

var Config = require('../../src/helpers/Config');
var models = require('../../src/database/sequelize');
var Message = models.message;
var Channel = models.channel;
var User = models.user;
var Organization = models.organization;
var { UserNotBelongsToChannelError } = require('../../src/helpers/Errors');
var { messageCreateData } = require('../data/messageData');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"MessageDao Tests"', () => {
    var user;
    var organization;
    var channel;
    var organizationData = Object.create(organizationCreateData);
    var channelData = Object.create(channelCreateData);
    var messageData = Object.create(messageCreateData);

    before(async () => {
        user = await User.create(userCreateData);
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        channelData.creatorId = user.id;
        channelData.organizationId = organization.id;
        channel = await Channel.create(channelData);
        channel.setUsers([user]);
        messageData.senderId = user.id;
        messageData.channelId = channel.id;
    });


    describe('Create message', () => {
        var msg;

        beforeEach(async () => {
            msg = await MessageDao.create(messageData);
        });

        it('message must be created', async () => {
            expect(msg).to.not.be.null;
        });

        it('message must have an id', async () => {
            expect(msg).to.have.property('id');
        });

        it('message channel must be correct', async () => {
            var msgChannel = await msg.getChannel();
            expect(msgChannel.id).to.eq(channel.id);
        });

        it('message sender must be correct', async () => {
            var sender = await msg.getSender();
            expect(sender.id).to.eq(user.id);
        });
    });

    describe('Create message with error', () => {
        var msg;
        var data;

        beforeEach(async () => {
            data = Object.create(messageData);
        });

        it('message must not be created without a sender', async () => {
            data.senderId = -2;
            await expect(MessageDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('channel must not be created without a channel', async () => {
            data.channelId = -2;
            await expect(MessageDao.create(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message sender must belong to channel', async () => {
            var user2 = await User.create(userCreateData);
            data.senderId = user2.id;
            await expect(MessageDao.create(data)).to.eventually.be.rejectedWith(UserNotBelongsToChannelError);
        });
    });

    describe('Get messages', () => {
        var mock;
        var msgs = [];

        before(async () => {
            mock = stub(Config, 'messagesPerPage').get(() => {return 2;});
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
        });

        after(async () => {
            mock.restore();
        });

        it('returns correct number of messages', async () => {
            var messages = await MessageDao.get(channel.id, 1);
            expect(messages).to.have.length(2);
        });

        it('page 1 returns last message', async () => {
            var messages = await MessageDao.get(channel.id, 1);
            expect(messages[0].id).to.eq(msgs[msgs.length - 1].id);
        });

        it('page 2 do not return last message', async () => {
            var messages = await MessageDao.get(channel.id, 2);
            expect(messages[0].id).to.not.eq(msgs[msgs.length - 1].id);
            expect(messages[1].id).to.not.eq(msgs[msgs.length - 1].id);
        });

        it('page n returns empty array', async () => {
            var messages = await MessageDao.get(channel.id, 99999);
            expect(messages).to.have.length(0);
        });

        it('last page returns less messages', async () => {
            mock.restore();
            var messages = await MessageDao.get(channel.id, 1);
            expect(messages).to.have.length.below(Config.messagesPerPage);
        });
        
    });
});
