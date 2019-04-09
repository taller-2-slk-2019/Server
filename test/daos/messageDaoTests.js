const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var MessageDao = require('../../src/daos/MessageDao');

var Config = require('../../src/helpers/Config');
var MessageParser = require('../../src/helpers/MessageParser');
var models = require('../../src/database/sequelize');
var Message = models.message;
var Channel = models.channel;
var Conversation = models.conversation;
var ForbiddenWord = models.forbiddenWord;
var User = models.user;
var Organization = models.organization;
var { UserNotBelongsToChannelError, UserNotBelongsToConversationError } = require('../../src/helpers/Errors');
var { messageCreateData } = require('../data/messageData');
var { conversationCreateData } = require('../data/conversationData');
var { channelCreateData } = require('../data/channelData');
var { userCreateData } = require('../data/userData');
var { organizationCreateData } = require('../data/organizationData');

describe('"MessageDao Tests"', () => {
    var user;
    var organization;
    var channel;
    var conversation;
    var organizationData = Object.create(organizationCreateData);
    var channelData = Object.create(channelCreateData);
    var conversationData = Object.create(conversationCreateData);
    var messageData = Object.create(messageCreateData);
    var messageConvData = Object.create(messageCreateData);

    before(async () => {
        user = await User.create(userCreateData());
        organizationData.creatorId = user.id;
        organization = await Organization.create(organizationData);
        channelData.creatorId = user.id;
        channelData.organizationId = organization.id;
        conversationData.organizationId = organization.id;
        channel = await Channel.create(channelData);
        await channel.setUsers([user]);
        conversation = await Conversation.create(conversationData);
        await conversation.setUsers([user]);
        messageData.senderToken = user.token;
        messageData.senderId = user.id;
        messageData.channelId = channel.id;
        messageConvData.senderToken = user.token;
        messageConvData.senderId = user.id;
        messageConvData.conversationId = conversation.id;
    });


    describe('Create message for channel', () => {
        var msg;

        beforeEach(async () => {
            msg = await MessageDao.createForChannel(messageData);
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

        it('message must not have conversation', async () => {
            var msgConversation = await msg.getConversation();
            expect(msgConversation).to.be.null;
        });

        it('message sender must be correct', async () => {
            var sender = await msg.getSender();
            expect(sender.id).to.eq(user.id);
        });
    });

    describe('Create message for channel with error', () => {
        var msg;
        var data;

        beforeEach(async () => {
            data = Object.create(messageData);
        });

        it('message must not be created without a sender', async () => {
            data.senderToken = "abc";
            await expect(MessageDao.createForChannel(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message must not be created without a channel', async () => {
            data.channelId = -2;
            data.senderToken = user.token;
            await expect(MessageDao.createForChannel(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message must not be created without data', async () => {
            data.data = null;
            await expect(MessageDao.createForChannel(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message sender must belong to channel', async () => {
            var user2 = await User.create(userCreateData());
            data.senderToken = user2.token;
            await expect(MessageDao.createForChannel(data)).to.eventually.be.rejectedWith(UserNotBelongsToChannelError);
        });
    });

    describe('Create message for conversation', () => {
        var msg;

        beforeEach(async () => {
            msg = await MessageDao.createForConversation(messageConvData);
        });

        it('message must be created', async () => {
            expect(msg).to.not.be.null;
        });

        it('message must have an id', async () => {
            expect(msg).to.have.property('id');
        });

        it('message conversation must be correct', async () => {
            var msgConversation = await msg.getConversation();
            expect(msgConversation.id).to.eq(conversation.id);
        });

        it('message channel must be null', async () => {
            var msgChannel = await msg.getChannel();
            expect(msgChannel).to.be.null;
        });

        it('message sender must be correct', async () => {
            var sender = await msg.getSender();
            expect(sender.id).to.eq(user.id);
        });
    });

    describe('Create message for conversation with error', () => {
        var msg;
        var data;

        beforeEach(async () => {
            data = Object.create(messageConvData);
        });

        it('message must not be created without a sender', async () => {
            data.senderToken = "abc";
            await expect(MessageDao.createForConversation(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message must not be created without a conversation', async () => {
            data.conversationId = -2;
            data.senderToken = user.token;
            await expect(MessageDao.createForConversation(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message must not be created without data', async () => {
            data.data = null;
            await expect(MessageDao.createForConversation(data)).to.eventually.be.rejectedWith(SequelizeValidationError);
        });

        it('message sender must belong to conversation', async () => {
            var user2 = await User.create(userCreateData());
            data.senderToken = user2.token;
            await expect(MessageDao.createForConversation(data)).to.eventually.be.rejectedWith(UserNotBelongsToConversationError);
        });
    });

    describe('Create message with forbidden words', () => {
        var msg;
        var data;
        var expected;

        before(async () => {
            data = Object.create(messageData);
            data.data = "forbidden word detected";
            expected = `forbidden ${Config.forbiddenWordsReplacement} detected`;
            forbidden = await ForbiddenWord.create({word: 'word', organizationId: organization.id});
        })

        it('forbidden word must be replaced', async () => {
            msg = await MessageDao.createForChannel(data);
            expect(msg.data).to.eq(expected);
        });

        it('words must not be replaced for files or images', async () => {
            data.type = 'image';
            msg = await MessageDao.createForChannel(data);
            expect(msg.data).to.eq(data.data);
        });

        
    });

    describe('Get channel messages', () => {
        var mock;
        var msgs = [];

        before(async () => {
            mock = stub(Config, 'messagesPerPage').get(() => {return 2;});
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageData));
            msgs.push(await Message.create(messageConvData));
        });

        after(async () => {
            mock.restore();
        });

        it('returns correct number of messages', async () => {
            var messages = await MessageDao.getForChannel(channel.id, 0);
            expect(messages).to.have.length(2);
        });

        it('first message is the lastest', async () => {
            var messages = await MessageDao.getForChannel(channel.id, 0);
            expect(messages[0].id).to.eq(msgs[msgs.length - 2].id);
        });

        it('offset n returns empty array', async () => {
            var messages = await MessageDao.getForChannel(channel.id, 99999);
            expect(messages).to.have.length(0);
        });

        it('last offset returns less messages', async () => {
            mock.restore();
            var messages = await MessageDao.getForChannel(channel.id, 4);
            expect(messages).to.have.length.below(Config.messagesPerPage);
        });
        
    });

    describe('Get conversation messages', () => {
        var mock;
        var msgs = [];

        before(async () => {
            mock = stub(Config, 'messagesPerPage').get(() => {return 2;});
            msgs.push(await Message.create(messageConvData));
            msgs.push(await Message.create(messageConvData));
            msgs.push(await Message.create(messageConvData));
            msgs.push(await Message.create(messageConvData));
            msgs.push(await Message.create(messageData));
        });

        after(async () => {
            mock.restore();
        });

        it('returns correct number of messages', async () => {
            var messages = await MessageDao.getForConversation(conversation.id, 0);
            expect(messages).to.have.length(2);
        });

        it('first message is the lastest', async () => {
            var messages = await MessageDao.getForConversation(conversation.id, 0);
            expect(messages[0].id).to.eq(msgs[msgs.length - 2].id);
        });

        it('offset n returns empty array', async () => {
            var messages = await MessageDao.getForConversation(conversation.id, 99999);
            expect(messages).to.have.length(0);
        });

        it('last offset returns less messages', async () => {
            mock.restore();
            var messages = await MessageDao.getForConversation(conversation.id, 4);
            expect(messages).to.have.length.below(Config.messagesPerPage);
        });
        
    });
});
