var expect = require('chai').expect;
var Message = require('../src/models/Message');

describe('"Messages Tests"', function() {

    describe('message test', function () {

        var message;

        beforeEach(function(){
            message = new Message('Hello world from testing');
        })

        it('message should be Hello world from testing', function () {
            expect(message.message).to.equal('Hello world from testing');
        });

        it('date should be 1234', function () {
            expect(message.date).to.equal(1234);
        });
    });

    describe('another message test', function () {

        it('should have message', function () {
            var message = new Message('test');
            expect(message).to.have.property('message');
        });
    });

});