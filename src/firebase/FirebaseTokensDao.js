class FirebaseTokensDao {

    async getForUsers(usernames){
        return usernames;
    }
}

module.exports = new FirebaseTokensDao();