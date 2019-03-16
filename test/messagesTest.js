var expect = require('chai').expect;
var Message = require('../src/db/sequelize').Message;

describe('"Messages Tests"', () => {

    describe('message test', () => {

        before(async () => {
            await Message.create({ firstName: 'test', lastName: 'test', email: 'test' });
        })

        it('message should be test', async () => {
            var msg = await Message.findOne();
            expect(msg.firstName).to.equal('test');
        });

        it('date should be 1234', () => {
            //expect(message.date).to.equal(1234);
        });
    });

    describe('another message test', () => {

        it('should have message', () => {
            //var message = new Message('test');
            //expect(message).to.have.property('message');
        });
    });

});