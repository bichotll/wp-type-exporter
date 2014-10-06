/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var _ = require('underscore');
var fs = require('fs');
var xml2js = require('xml2js');
var js2xmlparser = require('js2xmlparser');

function filterBy(result, post_parent, lang, category, stringCategory) {
    var tempResult = JSON.parse(JSON.stringify(result));

    tempResult.rss.channel[0].item[0] = {'wp:post_parent': [0]};

    var items = tempResult['rss']['channel'][0]['item'];

    var clients = _.filter(items, function(item) {
        return item['wp:post_parent'][0] === post_parent;
    });

    for (var i in clients) {
        clients[i]['wp:post_type'] = ['client'];
        clients[i]['wp:post_parent'] = ['0'];
        clients[i]['wp:menu_order'] = ['0'];

        //add category
        clients[i]['category'] = {
            '$': {
                'domain': 'type_of_client',
                'nicename': category
            },
            '_': stringCategory
        };

        //get url
        var patt = new RegExp("href=(\"|\')(.*)(\"|\') ");
        var result = patt.exec(clients[i]['content:encoded']);

        if (_.isArray(result)) {
            clients[i]['wp:postmeta'].push({
                'wp:meta_key': ['url'],
                'wp:meta_value': [result[2]]
            });
        }

        delete clients[i]['link'];
        delete clients[i]['guid'];
        delete clients[i]['wp:post_id'];
    }

    var options = {};
    options.attributeString = '$';
    options.valueString = '_';

    var finalArray = tempResult['rss'];
    finalArray['channel'][0]['item'] = clients;

    var finalXml = js2xmlparser("rss", finalArray, options);
    var fileName = "wp-clients-final-" + category + "-" + lang + ".xml";

    fs.writeFile(fileName, finalXml, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file " + fileName + " was saved!");
        }
    });
}

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/wp-pages.xml', function(err, data) {
    parser.parseString(data, function(err, result) {

        //es 211 n 209
        //en 619 n 617
        //fr 627 n 625
        //de 658 n 654 
        //ca 621 n 614
        //pt-pt 660 n 656

        //public entities
        filterBy(result, '211', 'es', 'public-entity', 'Public entity');
        filterBy(result, '619', 'en', 'public-entity', 'Public entity');
        filterBy(result, '627', 'fr', 'public-entity', 'Public entity');
        filterBy(result, '658', 'de', 'public-entity', 'Public entity');
        filterBy(result, '621', 'ca', 'public-entity', 'Public entity');
        filterBy(result, '660', 'pt-pt', 'public-entity', 'Public entity');

        //companies
        filterBy(result, '209', 'es', 'company', 'Company');
        filterBy(result, '617', 'en', 'company', 'Company');
        filterBy(result, '625', 'fr', 'company', 'Company');
        filterBy(result, '654', 'de', 'company', 'Company');
        filterBy(result, '614', 'ca', 'company', 'Company');
        filterBy(result, '656', 'pt-pt', 'company', 'Company');

    });
});
