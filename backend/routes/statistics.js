const _ = require('lodash');
const moment = require('moment');
const Promise = require('bluebird');
const debug = require('debug')('routes:statistics');
const nconf = require('nconf');

const mongo = require('../lib/mongo');

function statistics(req) {
    // the content in 'stats' is saved by count-o-clock and the selector here required is
    // specifiy in config/stats.json
    const expectedFormat = "/api/v2/statistics/:name/:unit/:amount";

    const allowedNames = ['supporters', 'contributions', 'metadata', 'processed'];
    const name = req.params.name;
    if(allowedNames.indexOf(name) == -1)
        return { json: { error: true, expectedFormat, allowedNames, note: `the statistic name you look for was ${name}` }}

    const unit = req.params.unit;
    const allowedRanges = ['hours', 'hour', 'day', 'days'];
    if(allowedRanges.indexOf(unit) == -1 )
        return { json: { error: true, expectedFormat, allowedRanges, note: `the statistic unit you look for was ${unit}` }}

    const amount = _.parseInt(req.params.amount);
    if(_.isNaN(amount))
        return { json: { error: true, expectedFormat, invalidNumber: req.params.amount }};

    debug("Requested statistics %s (starting from %d %s ago)", name, amount, unit);

    const filter = { name };
    const refDate = new Date( moment().subtract(amount, _.nth(unit, 0)));

    if(_.startsWith(unit, 'day'))
        _.set(filter, 'day', { '$gt': refDate });
    else
        _.set(filter, 'hour', { '$gt': refDate });

    return mongo
        .read(nconf.get('schema').stats, filter)
        .map(function(e) {
            return _.omit(e, ['_id'])
        })
        .then(function(content) {
            debug("Produced %d stats entry", _.size(content));
            return {
                json: content,
                headers: { amount, unit, name }
            };
        });
}

module.exports = {
    statistics
};
