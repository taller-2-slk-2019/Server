
class Config{
    
    static get messageUserMentionChar() { return '@'; }

    static get messageTypesWithText() { return ['text']; }

    static get messageTypesWithFiles() { return ['image', 'file', 'code']; }

    static get messageTypes() { return this.messageTypesWithText.concat(this.messageTypesWithFiles); }

    static get messagesPerPage() { return 25; }

    static get forbiddenWordsReplacement() { return '*****'; }

    static get mentionAllUsers() { return 'all'; }

}

module.exports = Config;