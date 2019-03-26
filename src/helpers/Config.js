
class Config{
    
    static get messageUserMentionChar() { return '@'; }

    static get messageTypesWithText() { return ['text', 'code']; }

    static get messageTypesWithFiles() { return ['image', 'file']; }

    static get messageTypes() { return this.messageTypesWithText.concat(this.messageTypesWithFiles); }

    static get messagesPerPage() { return 25; }

    static get forbiddenWordsReplacement() { return '*****'; }
}

module.exports = Config;