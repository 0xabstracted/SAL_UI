const eeriesCache = require('../eeries_cache.json')
const senshiCache = require('../senshi_cache.json')
const slimegoonsCache = require('../slimegoons_cache.json')

const getKeys =  () => {
    var object = {
        program: eeriesCache.program
    }
    var eeries_keys = Object.keys(eeriesCache.items);
    for (let index = 0; index < eeries_keys.length; index++) {
        const element = eeriesCache.items[eeries_keys[index]];
        if (element) {
            
        }
    }
}

