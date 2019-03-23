var organizationProfileMock = {
    id: 1,
    name: "organization",
    picture: "picture",
    latitude: 123.45678,
    longitude: 1234.455645,
    description: "org desc",
    welcome: "welcome!",
    createdAt: "2019-01-01T03:00:00.000Z",
    updatedAt: "2019-01-01T03:00:00.000Z",
    users: [
        {
            id: 1,
            name: "pepe",
            surname: "perez",
            email: "pe@dsad",
            picture: "picture",
            latitude: null,
            longitude: null,
            createdAt: "2019-01-01T03:00:00.000Z",
            updatedAt: "2019-01-01T03:00:00.000Z",
            userOrganizations: {
                role: "creator",
                createdAt: "2019-01-01T03:00:00.000Z",
                updatedAt: "2019-01-01T03:00:00.000Z",
            }
        }
    ],
    channels: [
        {
            id: 9,
            name: "org",
            visibility: "public",
            description: "description for organization",
            welcome: "welcome to the org!",
            createdAt: "2019-03-19T19:09:34.278Z",
            updatedAt: "2019-03-19T19:09:34.278Z",
        }
    ]
};

module.exports = organizationProfileMock;