var Config = require('./Config');
var UserRoleFactory = require('../factories/UserRoleFactory');

class HypechatError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.name = this.constructor.name;
    }
}

class InvalidQueryError extends HypechatError {
    constructor() {
        super("Invalid Query", 400);
    }
}

class UserNotFoundError extends HypechatError {
    constructor(userId) {
        super("User not found: " + userId, 404);
    }
}

class AdminUserNotFoundError extends HypechatError {
    constructor(user) {
        super("Admin not found: " + user, 404);
    }
}

class OrganizationNotFoundError extends HypechatError {
    constructor(organizationId) {
        super("Organization not found: " + organizationId, 404);
    }
}

class ChannelNotFoundError extends HypechatError {
    constructor(channelId) {
        super("Channel not found: " + channelId, 404);
    }
}

class ChannelAlreadyExistsError extends HypechatError {
    constructor(channelName, orgId) {
        super(`Channel ${channelName} already exists in organization ${orgId}`, 400);
    }
}

class MessageNotFoundError extends HypechatError {
    constructor(msgId) {
        super("Message not found: " + msgId, 404);
    }
}

class ConversationNotFoundError extends HypechatError {
    constructor(conversationId) {
        super("Conversation not found: " + conversationId, 404);
    }
}

class UserNotBelongsToOrganizationError extends HypechatError {
    constructor(organizationId, userId) {
        super(`User ${userId} does not belong to organization ${organizationId}`, 400);
    }
}

class UserAlreadyInChannelError extends HypechatError {
    constructor(channelId, userId) {
        super(`User ${userId} already belongs to channel ${channelId}`, 400); 
    }
}

class UserNotBelongsToChannelError extends HypechatError {
    constructor(channelId, userId) {
        super(`User ${userId} does not belong to channel ${channelId}`, 400);
    }
}

class UserNotBelongsToConversationError extends HypechatError {
    constructor(conversationId, userId) {
        super(`User ${userId} does not belong to conversation ${conversationId}`, 400);
    }
}

class InvalidOrganizationInvitationTokenError extends HypechatError {
    constructor(token) {
        super("Invalid token to be invited to an organization: " + token, 400);
    }
}

class InvalidLocationError extends HypechatError {
    constructor() {
        super("Location must have a latitude and a longitude", 400);
    }
}

class InvalidConversationError extends HypechatError {
    constructor() {
        super("Conversation must have two different users", 400);
    }
}

class InvalidMessageTypeError extends HypechatError {
    constructor() {
        super("Message type is invalid. Must be one of " + Config.messageTypes, 400);
    }
}

class InvalidMessageDataError extends HypechatError {
    constructor() {
        super("Message must hava data", 400); 
    }
}

class ForbiddenWordAlreadyExistsError extends HypechatError {
    constructor(word, organizationId) {
        super(`Forbidden word '${word}' already exists in organization ${organizationId}`, 400);
    }
}

class InvalidForbiddenWordError extends HypechatError {
    constructor(word) {
        super(`Forbidden word '${word}' is invalid`, 400); 
    }
}

class BotAlreadyExistsError extends HypechatError {
    constructor(bot, organizationId) {
        super(`Bot '${bot}' already exists in organization ${organizationId}`, 400);
    }
}

class InvalidBotError extends HypechatError {
    constructor(bot) {
        super(`Bot name '${bot}' is invalid`, 400);
    }
}

class InvalidUsernameError extends HypechatError {
    constructor(username) {
        super(`Username '${username}' is invalid`, 400);
    }
}

class InvalidUserRoleError extends HypechatError {
    constructor() {
        super("User role is invalid. Must be one of " + UserRoleFactory.roles, 400);
    }
}

class UnauthorizedUserError extends HypechatError {
    constructor() {
        super("User is not authorized", 401);
    }
}

module.exports = {
    HypechatError,
    UserNotFoundError,
    AdminUserNotFoundError,
    OrganizationNotFoundError,
    InvalidOrganizationInvitationTokenError,
    InvalidLocationError,
    ChannelNotFoundError,
    ConversationNotFoundError,
    UserNotBelongsToOrganizationError,
    UserAlreadyInChannelError,
    UserNotBelongsToChannelError,
    InvalidMessageTypeError,
    ForbiddenWordAlreadyExistsError,
    InvalidMessageDataError,
    InvalidConversationError,
    UserNotBelongsToConversationError,
    InvalidQueryError,
    MessageNotFoundError,
    BotAlreadyExistsError,
    InvalidUserRoleError,
    InvalidForbiddenWordError,
    InvalidBotError,
    ChannelAlreadyExistsError,
    UnauthorizedUserError,
    InvalidUsernameError
};