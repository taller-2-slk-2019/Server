const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);
const { stub, match } = require('sinon');

var SequelizeValidationError = require('../../src/database/sequelize').Sequelize.SequelizeValidationError;

var MessageDao = require('../../src/daos/MessageDao');
var MessageNotificationsService = require('../../src/services/MessageNotificationsService');

var Config = require('../../src/helpers/Config');
var MessageParser = require('../../src/helpers/MessageParser');
var models = require('../../src/database/sequelize');
var Message = models.message;
var Conversation = models.conversation;
var ForbiddenWord = models.forbiddenWord;
var TestDatabaseHelper = require('../TestDatabaseHelper');

var { UserNotBelongsToChannelError, UserNotBelongsToConversationError, 
    MessageNotFoundError, InvalidMessageDataError } = require('../../src/helpers/Errors');
var { messageCreateData } = require('../data/messageData');

describe('"MessageDao Tests"', () => {
    var user;
    var organization;
    var channel;
    var conversation;
    var messageData = Object.create(messageCreateData);
    var messageConvData = Object.create(messageCreateData);
    var notificationsMock;

    before(async () => {
        notificationsMock = stub(MessageNotificationsService, 'sendNotification').resolves();

        user = await TestDatabaseHelper.createUser();
        var user2 = await TestDatabaseHelper.createUser();
        organization = await TestDatabaseHelper.createOrganization([user]);
        channel = await TestDatabaseHelper.createChannel(user, organization);
        conversation = await TestDatabaseHelper.createConversation(user, user2, organization);

        messageData.senderToken = user.token;
        messageData.senderId = user.id;
        messageData.channelId = channel.id;
        messageConvData.senderToken = user.token;
        messageConvData.senderId = user.id;
        messageConvData.conversationId = conversation.id;
    });

    after(async () => {
        notificationsMock.restore();
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
            var user2 = await TestDatabaseHelper.createUser();
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
            var user2 = await TestDatabaseHelper.createUser();
            data.senderToken = user2.token;
            await expect(MessageDao.createForConversation(data)).to.eventually.be.rejectedWith(UserNotBelongsToConversationError);
        });
    });

    describe('Create channel message for bot', () => {
        var msg;
        var data = Object.create(messageCreateData);

        beforeEach(async () => {
            data.bot = "pepito";
            data.channelId = channel.id;
            msg = await MessageDao.createForBot(data);
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

        it('message sender must be null', async () => {
            var sender = await msg.getSender();
            expect(sender).to.be.null;
        });

        it('message bot must be correct', async () => {
            expect(msg.bot).to.eq('pepito');
        });
    });

    describe('Create conversation message for bot', () => {
        var msg;
        var data = Object.create(messageCreateData);

        beforeEach(async () => {
            data.bot = "pepito";
            data.conversationId = conversation.id;
            msg = await MessageDao.createForBot(data);
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

        it('message must not have channel', async () => {
            var msgChannel = await msg.getChannel();
            expect(msgChannel).to.be.null;
        });

        it('message sender must be null', async () => {
            var sender = await msg.getSender();
            expect(sender).to.be.null;
        });

        it('message bot must be correct', async () => {
            expect(msg.bot).to.eq('pepito');
        });
    });

    describe('Create message for bot with error', () => {
        var msg;
        var data = Object.create(messageCreateData);

        beforeEach(async () => {
            data.bot = "pepito";
            data.channelId = 0;
            data.conversationId = 0;
        });

        it('should fail', async () => {
            await expect(MessageDao.createForBot(data)).to.eventually.be.rejectedWith(InvalidMessageDataError);
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

    describe('Find by id', () => {
        var expected;
        var message;

        before(async () => {
            expected = await Message.create(messageData);
            message = await MessageDao.findById(expected.id);
        });

        it('message must not be null', async () => {
            expect(message).to.not.be.null;
        });

        it('message must have correct id', async () => {
            expect(message).to.have.property('id', expected.id);
        });

        it('message must have sender', async () => {
            expect(message).to.have.property('sender');
        });

        it('throws exception if id does not exist', async () => {
            await expect(MessageDao.findById(9999999)).to.eventually.be.rejectedWith(MessageNotFoundError);
        });

        it('throws exception if id is 0', async () => {
            await expect(MessageDao.findById(0)).to.eventually.be.rejectedWith(MessageNotFoundError);
        });

        it('throws exception if id is -1', async () => {
            await expect(MessageDao.findById(-1)).to.eventually.be.rejectedWith(MessageNotFoundError);
        });
    });
});
