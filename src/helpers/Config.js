
class Config{
    
    static get messageUserMentionChar() { return '@'; }

    static get messageTypesWithText() { return ['text']; }

    static get messageTypesWithFiles() { return ['image', 'file', 'code']; }

    static get messageTypes() { return this.messageTypesWithText.concat(this.messageTypesWithFiles); }

    static get messagesPerPage() { return 25; }

    static get forbiddenWordsReplacement() { return '*****'; }

    static get mentionAllUsers() { return 'all'; }

    static get botToken() { return 'dfe53812-8ce9-41db-a57e-79456936dfb3'; }

}

module.exports = Config;