const SINGLE_WORD_REGEX = /^[a-zA-Z0-9]+$/;

class Validator {

    validateSingleWord(word){
        if (!word) {
            return false;
        }
        return SINGLE_WORD_REGEX.test(word);
    }
}

module.exports = new Validator();