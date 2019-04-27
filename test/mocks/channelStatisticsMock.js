const ChannelStatistics = require('../../src/models/statistics/ChannelStatistics');

var stats = new ChannelStatistics();

stats.setMessageCount(10);

module.exports = stats;