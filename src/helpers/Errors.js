var Config = require('./Config');

class UserNotFoundError extends Error {
    constructor(userId) {
        super("User not found: " + userId);
        this.name = this.constructor.name;
    }
}

class OrganizationNotFoundError extends Error {
    constructor(organizationId) {
        super("Organization not found: " + organizationId);
        this.name = this.constructor.name;
    }
}

class ChannelNotFoundError extends Error {
    constructor(channelId) {
        super("Channel not found: " + channelId);
        this.name = this.constructor.name;
    }
}

class ConversationNotFoundError extends Error {
    constructor(conversationId) {
        super("Conversation not found: " + conversationId);
        this.name = this.constructor.name;
    }
}

class UserAlreadyInvitedError extends Error {
    constructor(organizationId, userId) {
        super(`User ${userId} is already invited to organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

class UserAlreadyInOrganizationError extends Error {
    constructor(organizationId, userId) {
        super(`User ${userId} already belongs to organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

class UserNotBelongsToOrganizationError extends Error {
    constructor(organizationId, userId) {
        super(`User ${userId} does not belong to organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

class UserAlreadyInChannelError extends Error {
    constructor(channelId, userId) {
        super(`User ${userId} already belongs to channel ${channelId}`);
        this.name = this.constructor.name;
    }
}

class UserNotBelongsToChannelError extends Error {
    constructor(channelId, userId) {
        super(`User ${userId} does not belong to channel ${channelId}`);
        this.name = this.constructor.name;
    }
}

class UserNotBelongsToConversationError extends Error {
    constructor(conversationId, userId) {
        super(`User ${userId} does not belong to conversation ${conversationId}`);
        this.name = this.constructor.name;
    }
}

class InvalidOrganizationInvitationTokenError extends Error {
    constructor(token) {
        super("Invalid token to be invited to an organization: " + token);
        this.name = this.constructor.name;
    }
}

class InvalidLocationError extends Error {
    constructor() {
        super("Location must have a latitude and a longitude");
        this.name = this.constructor.name;
    }
}

class InvalidConversationError extends Error {
    constructor() {
        super("Conversation must have two different users");
        this.name = this.constructor.name;
    }
}

class InvalidMessageTypeError extends Error {
    constructor() {
        super("Message type is invalid. Must be one of " + Config.messageTypes);
        this.name = this.constructor.name;
    }
}

class InvalidMessageDataError extends Error {
    constructor() {
        super("Message must hava data");
        this.name = this.constructor.name;
    }
}

class ForbiddenWordAlreadyExistsError extends Error {
    constructor(word, organizationId) {
        super(`Forbidden word '${word}' already exists in organization ${organizationId}`);
        this.name = this.constructor.name;
    }
}

module.exports = {
    UserNotFoundError: UserNotFoundError,
    OrganizationNotFoundError: OrganizationNotFoundError,
    UserAlreadyInvitedError: UserAlreadyInvitedError,
    UserAlreadyInOrganizationError: UserAlreadyInOrganizationError,
    InvalidOrganizationInvitationTokenError: InvalidOrganizationInvitationTokenError,
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
    UserNotBelongsToConversationError
};