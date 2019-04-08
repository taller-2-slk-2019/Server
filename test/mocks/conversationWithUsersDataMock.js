var conversationWithUsersDataMock = {
    id: 1,
    createdAt: "2019-09-09T03:00:00.000Z",
    updatedAt: "2019-09-09T03:00:00.000Z",
    organizationId: 1,
    users: [
        {
            id: 1,
            name: "carl",
            email: "pepe@gmail.com",
            picture: "default.jpg",
            latitude: 1234,
            longitude: 1234,
            username: "pepito",
            createdAt: "2019-03-22T07:39:58.855Z",
            updatedAt: "2019-03-29T19:14:31.044Z",
            conversationUsers: {
                createdAt: "2019-09-09T03:00:00.000Z",
                updatedAt: "2019-09-09T03:00:00.000Z",
                conversationId: 1,
                userId: 1
            }
        }
    ]
};

module.exports = conversationWithUsersDataMock;