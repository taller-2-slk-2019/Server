var organizationProfileMock = {
    id: 1,
    name: "org",
    picture: "picture",
    latitude: 1234.434,
    longitude: 123.432,
    description: "description for organization",
    welcome: "welcome to the org!",
    createdAt: "2019-03-22T07:41:07.906Z",
    updatedAt: "2019-03-22T07:41:07.906Z",
    users: [
        {
            id: 1,
            name: "jose",
            surname: "Perez",
            email: "pepe@gmail.com",
            picture: "default.jpg",
            latitude: null,
            longitude: null,
            createdAt: "2019-03-22T07:39:58.855Z",
            updatedAt: "2019-03-26T18:44:56.899Z",
            userOrganizations: {
                role: "creator",
                createdAt: "2019-03-22T07:41:07.919Z",
                updatedAt: "2019-03-22T07:41:07.919Z",
                organizationId: 1,
                userId: 1
            }
        }
    ],
    userChannels: [
        {
            id: 1,
            name: "channel",
            visibility: "public",
            description: "description for channel",
            welcome: "welcome to the org!",
            createdAt: "2019-03-22T07:42:56.935Z",
            updatedAt: "2019-03-22T07:42:56.935Z",
            creatorId: 1,
            organizationId: 1,
            users: [
                {
                    id: 1,
                    name: "jose",
                    surname: "Perez",
                    email: "pepe@gmail.com",
                    picture: "default.jpg",
                    latitude: null,
                    longitude: null,
                    createdAt: "2019-03-22T07:39:58.855Z",
                    updatedAt: "2019-03-26T18:44:56.899Z",
                    channelUsers: {
                        createdAt: "2019-03-26T19:02:37.006Z",
                        updatedAt: "2019-03-26T19:02:37.006Z",
                        channelId: 1,
                        userId: 1
                    }
                }
            ]
        }
    ]
};

module.exports = organizationProfileMock;