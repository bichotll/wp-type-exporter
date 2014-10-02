/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var _ = require('underscore');
var fs = require('fs');
var xml2js = require('xml2js');
var js2xmlparser = require('js2xmlparser');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/wp-pages.xml', function(err, data) {
    parser.parseString(data, function(err, result) {

        var items = result['rss']['channel'][0]['item'];

        var clients = _.filter(items, function(item) {
            var client = _.filter(item['wp:postmeta'], function(postmedia) {
                return postmedia['wp:meta_value'][0] === 'plantilla_clientes.php';
            });

            return client.length !== 0;
        });

        console.log(clients[0]);

        for (var i in clients) {
            clients[i]['wp:post_type'] = ['client'];
            clients[i]['wp:post_parent'] = ['0'];
            clients[i]['wp:menu_order'] = ['0'];

            delete clients[i]['link'];
            //delete clients[i]['dc:creator'];
            delete clients[i]['guid'];
            delete clients[i]['wp:post_id'];
        }

        var finalXml = js2xmlparser("channel", {'item': clients});

        fs.writeFile("wp-clients-final.xml", finalXml, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("The file was saved!");

                console.log('\n\n\n-----------\n\n\n');
                //console.dir(result['rss']['channel'][0]['item'][0]);
                console.log('Done');
            }
        });
    });
});
