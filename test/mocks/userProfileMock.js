var userProfileMock = {
    id: 1,
    name: "Pepe",
    surname: "Perez",
    email: "pepe@gmail.com",
    picture: "default.jpg",
    latitude: null,
    longitude: null,
    createdAt: "2019-03-25T21:54:33.593Z",
    updatedAt: "2019-03-25T21:54:33.593Z",
    organizations: [
        {
            id: 1,
            name: "org",
            picture: "picture",
            latitude: 1234.434,
            longitude: 123.432,
            description: "description for organization",
            welcome: "welcome to the org!",
            createdAt: "2019-03-25T21:55:51.303Z",
            updatedAt: "2019-03-25T21:55:51.303Z",
            userOrganizations: {
                role: "creator",
                createdAt: "2019-03-25T21:55:51.414Z",
                updatedAt: "2019-03-25T21:55:51.414Z",
                organizationId: 1,
                userId: 1
            }
        }
    ]
};

module.exports = userProfileMock;
