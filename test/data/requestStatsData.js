var requestStatsData = [
    {
        method: 'POST',
        statusCode: 200,
        resource: 'channels',
        isAdmin: false,
        responseTime: 123,
        error: null
    },
    {
        method: 'DELETE',
        statusCode: 400,
        resource: 'organizations',
        isAdmin: true,
        responseTime: 234,
        error: 'OrganizationError'
    }
];

module.exports = { 
    requestStatsData: requestStatsData,
};